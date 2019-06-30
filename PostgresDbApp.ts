import {Pool} from "pg";
import * as faker from 'faker';
import {ActorModel} from "./model/postgres/ActorModel";
import {RoleModel} from "./model/postgres/RoleModel";
import {MovieModel} from "./model/postgres/MovieModel";
import {ReviewModel} from "./model/postgres/ReviewModel";

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sbd',
    port: 5432,
});

export class PostgresDbApp {
    private n: number = 250000;
    private i: number = 0;

    public start() {
        console.log(`PLAN FOR ${this.n} ROWS \n`);

        this.createData();
        // this.readData();
        // this.updateData();
        // this.deleteData();
    }

    private createData() {
        console.log("CREATE_DATA");
        this.insertMovies();
        // this.insertReviews();
        this.insertActors();
        // this.insertRoles();
    }

    private readData() {
        console.log("READ_DATA");
        let query = 'EXPLAIN ANALYZE SELECT m.id, m.title, avg(r.rating) AS rating FROM movie m INNER JOIN review r ON m.id = r.movie_id GROUP BY m.id, m.title, rating ORDER BY rating DESC LIMIT 500;';
        this.executeStatement(query, 'readData');
    }

    private updateData() {
        console.log("UPDATE_DATA");
        let query = 'EXPLAIN ANALYZE UPDATE movie SET title = INITCAP(title) WHERE title != INITCAP(title);';
        this.executeStatement(query, 'updateData');
    }

    private deleteData() {
        console.log("DELETE_DATA");
        this.deleteAllRoles();
        // this.deleteAllActors();
        // this.deleteAllReviews();
        // this.deleteAllMovies();
    }


    private insertMovies() {
        console.log("\t * insert movies");
        let query = this.generateInsertMoviesQuery();
        this.executeStatement(query, 'insert_movies');
    }

    private insertReviews() {
        console.log("\t * insert reviews");
        let query = this.generateInsertReviewsQuery();
        this.executeStatement(query, 'insert_reviews');
    }

    private insertActors() {
        console.log("\t * insert actors");
        let query = this.generateInsertActorsQuery();
        this.executeStatement(query, 'insert_actors');
    }

    private insertRoles() {
        console.log("\t * insert roles");
        let query = this.generateInsertRolesQuery();
        this.executeStatement(query, 'insert_roles');
    }

    private deleteAllRoles() {
        console.log("\t * delete roles");
        let query = 'EXPLAIN ANALYZE DELETE FROM role WHERE id notnull;';
        this.executeStatement(query, 'delete_roles');
    }

    private deleteAllActors() {
        console.log("\t * delete actors");
        let query = 'EXPLAIN ANALYZE DELETE FROM actor WHERE id notnull;';
        this.executeStatement(query, 'delete_actors');
    }

    private deleteAllReviews() {
        console.log("\t * delete reviews");
        let query = 'EXPLAIN ANALYZE DELETE FROM review WHERE id notnull;';
        this.executeStatement(query, 'delete_movies');
    }

    private deleteAllMovies() {
        console.log("\t * delete movies");
        let query = 'EXPLAIN ANALYZE DELETE FROM movie WHERE id notnull;';
        this.executeStatement(query, 'delete_movies');
    }

    private generateInsertMoviesQuery() {
        let prefix = 'EXPLAIN ANALYZE INSERT INTO public.movie (title, runtime, release_date, country) VALUES';
        let values: string = this.generateMovies().map(movie => `('${movie.title}', ${movie.runtime}, ${movie.releaseDate}, '${movie.country}')`).join(",");
        return `${prefix} ${values};`
    }

    private generateInsertReviewsQuery() {
        let prefix = 'EXPLAIN ANALYZE INSERT INTO public.review (rating, description, movie_id) VALUES';
        let values: string = this.generateReviews().map(review => `(${review.rating}, '${review.description}', ${review.movieId})`).join(",");
        return `${prefix} ${values};`
    }

    private generateInsertActorsQuery() {
        let prefix = 'EXPLAIN ANALYZE INSERT INTO public.actor (first_name, last_name, birth_year) VALUES';
        let values: string = this.generateActors().map(actor => `('${actor.firstName}', '${actor.lastName}', ${actor.birthYear})`).join(",");
        return `${prefix} ${values};`
    }

    private generateInsertRolesQuery() {
        let prefix = 'EXPLAIN ANALYZE INSERT INTO public.role (role_name, actor_id, movie_id) VALUES';
        let values: string = this.generateRoles().map(role => `('${role.roleName}', ${role.actorId}, ${role.movieId})`).join(",");
        return `${prefix} ${values};`
    }


    private generateMovies(): MovieModel[] {
        let movies: MovieModel[] = [];
        Array.from(Array(this.n).keys()).forEach(() => movies.push(this.generateMovie()));
        return movies;
    }

    private generateReviews(): ReviewModel[] {
        let reviews: ReviewModel[] = [];
        Array.from(Array(2 * this.n).keys()).forEach((id) => reviews.push(this.generateReview(id)));
        return reviews;
    }

    private generateActors(): ActorModel[] {
        let actors: ActorModel[] = [];
        Array.from(Array(this.n).keys()).forEach(() => actors.push(this.generateActor()));
        return actors;
    }

    private generateRoles(): RoleModel[] {
        let roles: RoleModel[] = [];
        Array.from(Array(this.n).keys()).forEach((id) => roles.push(this.generateRole(id)));
        return roles;
    }

    private generateMovie(): MovieModel {
        return {
            title: faker.lorem.words(3).replace("'", "''"),
            runtime: faker.random.number({min: 90, max: 160, precision: 5}),
            country: faker.address.country().replace("'", "''"),
            releaseDate: faker.date.past().getFullYear()
        };
    }

    private generateReview(id: number): ReviewModel {
        return {
            rating: faker.random.number({min: 1, max: 5, precision: 1}),
            description: faker.lorem.lines(1).replace("'", "''"),
            movieId: Math.floor((id / 2) + 1)
        };
    }

    private generateActor(): ActorModel {
        return {
            firstName: faker.name.firstName().replace("'", "''"),
            lastName: faker.name.lastName().replace("'", "''"),
            birthYear: faker.date.past().getFullYear()
        };
    }

    private generateRole(id: number): RoleModel {
        return {
            roleName: `${faker.name.firstName().replace("'", "''")} ${faker.name.lastName().replace("'", "''")}`,
            actorId: faker.random.number({min: 1, max: this.n, precision: 1}),
            movieId: Math.floor((id / 2) + 1)
        };
    }

    private executeStatement(query: string, note: string) {
        let number = this.i++;
        pool.connect().then(client => {
            console.time(`test - ${note}`);
            client.query(query).then(result => {
                console.log(result.rows);
            }).then((res) => {
                client.release();
                console.timeEnd(`test - ${note}`);
                // this.elapsed_time("end test");
                console.log(res);
            }, (e) => {
                client.release(e);
                console.log(e)
            });
        });
        pool.on('error', (err, client) => {
            console.error('idle client error', err.message, err.stack);
        });
    }
}

const app = new PostgresDbApp();
app.start();
