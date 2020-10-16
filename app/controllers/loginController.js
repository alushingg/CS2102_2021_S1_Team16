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
//         add more data if required
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

exports.getUserType = function(username, callback) {
    const po_query = "SELECT * FROM pet_owner WHERE username = '" + username + "';";
    const ct_query = "SELECT * FROM care_taker WHERE username = '" + username + "';";
    const a_query = "SELECT * FROM pcs_admin WHERE username = '" + username + "';";
    var isOwner = false;
    var isCaretaker = false;
    var isAdmin = false;
    dbController.queryGet(po_query, (result) => {
        if(result.body.rows.length === 1) {
            isOwner = true;
        }
        dbController.queryGet(ct_query, (result) => {
            if(result.body.rows.length === 1) {
                isCaretaker = true;
            }
            dbController.queryGet(a_query, (result) => {
                if(result.body.rows.length === 1) {
                    isAdmin = true;
                }
                callback(isOwner, isCaretaker, isAdmin);
            });
        });
    });
}

exports.authUser = function(userData, isOwner, isCaretaker, isAdmin, session) {
    userController.trackUser(userData, isOwner, isCaretaker, isAdmin);
    session.authenticated = true;
}

exports.logoutUser = function() {
    userController.logout();
}