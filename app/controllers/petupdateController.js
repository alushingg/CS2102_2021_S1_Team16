const dbController = require('./dbController');
const userController = require('./userController');


exports.trackPet = function(petData) {
    const user = userController.getUser().getUsername();
    const query = "SELECT DISTINCT o.name, o.type FROM own_pet_belong o LEFT JOIN has h ON o.username = h.username WHERE o.username = '" + user + "';";
    dbController.queryGet(query, (result) => {
         if(result.status == 200) {
             callback(result.body.rows);
         } else {
             console.log("Failed.");
             console.log("Status code: " + result.status);
             callback([]);
         }
     });
};

exports.getPets = function(callback) {
    const user = userController.getUser().getUsername();
    const query = "SELECT DISTINCT o.name, o.type FROM own_pet_belong o LEFT JOIN has h ON o.username = h.username WHERE o.username = '" + user + "';";
    dbController.queryGet(query, (result) => {
         if(result.status == 200) {
             callback(result.body.rows);
         } else {
             console.log("Failed.");
             console.log("Status code: " + result.status);
             callback([]);
         }
     });
};

exports.editPet = function(requestBody, callback) {
    const user = userController.getUser().getUsername();
    var modifiedfields = '';
    var updated = '';
    console.log("Name: " + requestBody.name + " Diet: " + requestBody.diet + " Walk: " + requestBody.walk);

    updated = "DELETE FROM has WHERE username='" + user + "' AND name='" + requestBody.name + "';";
    if (requestBody.diet != 'None') {
        updated = updated + "INSERT INTO has VALUES ('" + user + "', '" + requestBody.name + "', 'diet', '"
                    + requestBody.diet + "');"
    }
    if (requestBody.walk != 'None') {
        updated = updated + "INSERT INTO has VALUES ('" + user + "', '" + requestBody.name + "', 'walk', '"
                    + requestBody.walk + "');"
    }

    const query = updated;
    console.log("Query: " + query);
    dbController.queryGet(query, (result) => {
        if(result.status == 200) {
            callback(result.body.rows);
        } else {
            console.log("Failed.");
            console.log("Status code: " + result.status);
            callback([]);
        }
    });
}