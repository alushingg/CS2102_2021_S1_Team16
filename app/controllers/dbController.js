const db = require('../database/database')

// These are the different methods you can use to process requests.
// Can ask db to do query with db.query(<Query>);

exports.queryGet = function (request, response) {
    response.status(200).json({
        'Status':'200 OK',
    });
}

exports.queryPost = function (request, response) {
    response.status(201).json({
        'Status':'201 Created',
    });
}

exports.queryPut = function (request, response) {
    response.status(200).json({
        'Status':'200 OK',
    });
}

exports.queryDelete = function (request, response) {
    response.status(200).json({
        'Status':'200 OK',
    });
}

// Add other functions here if needed...
