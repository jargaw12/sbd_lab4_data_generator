import {AggregationCursorResult, MongoClient} from "mongodb";
import {MovieDocument} from "./model/mongo/MovieDocument";
import * as faker from 'faker';
import * as assert from "assert";

export class MongoDbApp {
    private url: string = 'mongodb://localhost:27017/sbd';
    private n: number = 250000;

    public start() {
        this.connect().then(client => {
            const db = client.db();

            this.insertData(client);
            // this.findData(client);
            // this.findAll(client);
            // this.findReviews(client);
            // this.updateData(client);
            // this.deleteData(client);

            // client.close();
        }).catch(err => {
            console.log("Unable to connect to db");
            console.log(err)
        });
    }

    public connect() {
        return MongoClient.connect(this.url, {useNewUrlParser: true});
    }

    public insertData(client: MongoClient) {
        const db = client.db();
        const documents = this.generateMovieDocuments();

        let bulk = db
            .collection("movies")
            .initializeUnorderedBulkOp();

        console.log('document.size() = ' + documents.length);
        let before: Date = new Date()
        let before2: Date = new Date()
        // db
        //     .collection("movies")
        //     .insertMany(documents, ((error, result) => {
        //         console.log('added movies');
        //         console.log(result);
        //         // client.close();
        //     }));
        documents.forEach(doc => bulk.insert(doc));
        bulk.execute().then((error) => console.log(error)).finally(() => {
            let after2: Date = new Date();
            console.log(`Time diff - insert -- (final): ${+after2 - +before2} [ms]`);
            client.close()
        });
        let after: Date = new Date();
        console.log(`Time diff - insert: ${(+after - +before)} [ms]`);
    }

    public findData(client: MongoClient) {
        const db = client.db();
        let before = new Date();
        db
            .collection("movies")
            .aggregate([
                {"$unwind": "$reviews"},
                {
                    $group: {
                        _id: '$title',
                        avg: {$avg: '$reviews.rating'}
                    }
                },
                {$sort: {avg: -1}}
            ],
                )
            .explain((error, result: AggregationCursorResult) =>
                console.log(result));

        let after = new Date();
        console.log(`Time diff - find: ${+after - +before} [ms]`);
    }

    findAll(client: MongoClient) {
        const db = client.db();
        let before = new Date();
        db.collection('movies').find({}).explain(function (err, explaination) {
            assert.strictEqual(null, err);
            console.log(explaination);
            // db.close();
        });
        let after = new Date();
        console.log(`Time diff - insert: ${+after - +before} [ms]`);
    }

    findReviews(client: MongoClient) {
        const db = client.db();
        let before = new Date();
        db.collection('movies').find({
            "reviews.rating": {
                '$gt': 1,
                '$lt': 5
            }
        }).explain(function (err, explaination) {
            assert.strictEqual(null, err);
            console.log(explaination);
            // db.close();
        });
        let after = new Date();
        console.log(`Time diff - insert: ${+after - +before} [ms]`);
    }

    public updateData(client: MongoClient) {
        const db = client.db();
        let before = new Date();
        db
            .collection("movies")
            .updateMany({$set: {"title": {$toUpper: "$title"}}}, () => {
                console.log("updated")
            }).then(result => result);

        let after = new Date();
        console.log(`Time diff1: ${+after - +before} [ms]`);
    }

    public deleteData(client: MongoClient) {
        const db = client.db();
        let before = new Date();
        db.collection('movies').drop();
        let after = new Date();
        console.log(`Time diff - insert: ${+after - +before} [ms]`);
    }

    public generateMovieDocuments(): MovieDocument[] {
        let documents: MovieDocument[] = [];
        Array.from(Array(this.n).keys()).forEach(() => documents.push(this.generateMovieDocument()));
        return documents;
    }

    public generateMovieDocument(): MovieDocument {
        return {
            title: faker.lorem.words(3),
            runtime: faker.random.number({min: 90, max: 160, precision: 5}),
            country: faker.address.country(),
            releaseDate: faker.date.past().getFullYear(),
            reviews: [
                {
                    rating: faker.random.number({min: 1, max: 5, precision: 1}),
                    description: faker.lorem.lines(1)
                },
                {
                    rating: faker.random.number({min: 1, max: 5, precision: 1}),
                    description: faker.lorem.lines(1)
                }
            ],
            cast: [
                {
                    fullName: `${faker.name.firstName()} ${faker.name.lastName()}`,
                    roleName: `${faker.name.firstName()} ${faker.name.lastName()}`,
                },
                {
                    fullName: `${faker.name.firstName()} ${faker.name.lastName()}`,
                    roleName: `${faker.name.firstName()} ${faker.name.lastName()}`,
                }
            ]
        };
    }
}

const app = new MongoDbApp();
app.start();
