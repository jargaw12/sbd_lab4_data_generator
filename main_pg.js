const Pool = require('pg').Pool;
const sql = require('sql');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sbd',
    port: 5432,
});


const getUsers = () => {
    let Actor = sql.define({
        name: 'actor',
        columns: [
            'id',
            'first_name',
            'last_name',
            'birth_year'
        ]
    });


    pool.connect();
    let actors = [{first_name: "aaaa", last_name: "aaaa", birth_year: 111111}, {
        first_name: "bbbb",
        last_name: "bbbbb",
        birth_year: 2222
    }];
    let query = Actor.insert(actors).toQuery();
    query.text = 'EXPLAIN ANALYZE ' +  query.text;
    pool.query(query,
        (error, results) => {
            if (error) {
                throw error
            }
            console.log(results.rows);
        });
    pool.end();
};

getUsers();
