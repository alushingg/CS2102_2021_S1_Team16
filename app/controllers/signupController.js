const dbController = require('./dbController');

// Login Controller
var title = 'Sign Up';

// Gets the page info
exports.getPageInfo = function() {
    return {
        'title': title,
        'error': false,
        'error_reason': null,
        // add more data if required
    }
}

exports.getErrorPageInfo = function(error) {
    return {
        'title': title,
        'error': true,
        'error_reason': error,
        // add more data if required
    }
}

exports.registerUser = function(requestBody, callback) {
    const query = "INSERT INTO users VALUES ('" + requestBody.username + "', '" + requestBody.password + "', '" 
                        + requestBody.name + "', " + requestBody.phone + ", '" + requestBody.area + "');";
    dbController.queryPost(query, (result) => {
        if(result.status == 201) {
            console.log("Register User OK");
        } else {
            console.log("Register User failed");
            console.log(result);
        }
        callback(result.status);
    });
}

exports.registerOwner = function(requestBody, callback) {
    const query = "INSERT INTO pet_owner VALUES ('" + requestBody.username + "', NULL);";
    dbController.queryPost(query, (result) => {
        if(result.status == 201) {
            console.log("Register Owner OK");
        } else {
            console.log("Register Owner failed");
            console.log(result);
        }
        callback(result.status);
    });
}