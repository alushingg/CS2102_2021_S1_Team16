const userController = require('./userController');
const dbController = require('./dbController');

// Login Controller
const title = 'Login';

// Gets the page info
exports.getPageInfo = function() {
    return {
        'title': title,
        'error': false,
        // add more data if required
    }
}

exports.getErrorPageInfo = function() {
    return {
        'title': title,
        'error': true,
        // add more data if required
    }
}

exports.getCredentials = function(requestBody, callback) {
    const query = "SELECT * FROM users WHERE username = '" + requestBody.username + "' AND password = '" + requestBody.password + "';";
    dbController.queryGet(query, (result) => {
        if(result.status == 200) {
            callback(result.body.rows);
        } else {
            console.log("Credential check failed.");
            console.log("Status code: " + result.status);
            callback([]);
        }
    });
}

exports.checkCredentials = function(credentials) {
    return credentials.length === 1;
}

exports.authUser = function(userData, session) {
    userController.trackUser(userData);
    session.authenticated = true;
}

exports.logoutUser = function() {
    userController.logout();
}