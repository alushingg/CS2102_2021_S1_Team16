const db = require('../database/database')

// These are the different methods you can use to process requests.
// Can ask db to do query with db.query(<Query>);

exports.queryGet = function (query, callback) {
    db.query(query, (error, result) => {
        if(error) {
          console.log('!!'+error);
            callback({
                status: 404,
                err: error,
            });
        } else {
            callback({
                status: 200,
                body: result,
            });
        }
    });
}

exports.queryPost = function (query, response) {
    response.status(201).json({
        'Status':'201 Created',
    });
}

exports.queryPut = function (query, response) {
    response.status(200).json({
        'Status':'200 OK',
    });
}

exports.queryDelete = function (query, response) {
    response.status(200).json({
        'Status':'200 OK',
    });
}

// Add other functions here if needed...
// Problem: Query is asynchronous
