const assert = require('assert');
const faker = require('faker');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/sbd';
const mongoProfiler = require('mongodb-profiler');

const email = faker.internet.email();
console.log(email);

MongoClient.connect(url, {useNewUrlParser: true}, (err, client) => {

    assert.strictEqual(null, err);
    const db = client.db('sbd');
    // db.collection('movies').find({}).explain(function (err, explaination) {
    //     assert.strictEqual(null, err);
    //     console.log(explaination);
    //     db.close();
    // });

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
        ], {
            explain: true
        })
        .explain((error, result) =>
            console.log(result.stages[0]));

    // var profiler = mongoProfiler({
    //     db: db, profile: {
    //         all: true
    //     }
    // });

    // profiler.on("profile", function (profile) {
    //     //     profiler.explainProfile(profile, function (err, plan) {
    //     //     });
    //     // });
    //     //
    //     // console.log("profiler");
    //     // console.log(profiler);
});
