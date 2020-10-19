const dbController = require('./dbController');
const userController = require('./userController');


exports.trackPet = function(req, callback) {
    const user = userController.getUser().getUsername();
    const { petname } = req.params;
    const query = "SELECT h.rtype, h.requirement" +
                    " FROM own_pet_belong o NATURAL JOIN has h" +
                    " WHERE o.username = '" + user + "' AND o.name = '" + petname + "';";
    dbController.queryGet(query, (result) => {
         if(result.status == 200) {
            console.log(query);
             callback(result.body.rows, petname);
         } else {
             console.log("Failed.");
             console.log("Status code: " + result.status);
             callback([], "");
         }
     });
};

exports.addPet = function(requestBody, callback) {
    const user = userController.getUser().getUsername();
    console.log("Name: " + requestBody.petname + " Type: "+ requestBody.type +
            " Diet: " + requestBody.diet + " Walk: " + requestBody.walk);
    var added = "INSERT INTO own_pet_belong VALUES ('" + user + "', '" + requestBody.petname + "', '" +
                requestBody.type + "');";

    if (requestBody.diet != "None") {
        added = added + " INSERT INTO has VALUES ('" + user + "', '" + requestBody.petname + "', 'diet', '" +
             requestBody.diet + "');";
    }

    if (requestBody.walk != "None") {
        added = added + " INSERT INTO has VALUES ('" + user + "', '" + requestBody.petname + "', 'walk', '" +
             requestBody.walk + "');";
    }

    const query = added;
    console.log("Query: " + query);
    dbController.queryGet(query, (result) => {
        if(result.status == 200) {
            callback(result.body.rows, "");
        } else {
            console.log("Failed.");
            console.log("Status code: " + result.status);
            callback([], result.err.message);
        }
    });
}

exports.editPet = function(requestBody, requestParam, callback) {
    const user = userController.getUser().getUsername();
    const { petname } = requestParam;
    var modifiedfields = '';
    var updated = '';
    console.log("Name: " + petname + " Diet: " + requestBody.diet + " Walk: " + requestBody.walk);

    updated = "DELETE FROM has WHERE username='" + user + "' AND name='" + petname + "';";
    if (requestBody.diet != 'None') {
        updated = updated + "INSERT INTO has VALUES ('" + user + "', '" + petname + "', 'diet', '"
                    + requestBody.diet + "');"
    }
    if (requestBody.walk != 'None') {
        updated = updated + "INSERT INTO has VALUES ('" + user + "', '" + petname + "', 'walk', '"
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

exports.deletePet = function(req, callback) {
    const { petname } = req.params;
    const user = userController.getUser().getUsername();
    console.log("Name: " + petname);

    const query = "DELETE from own_pet_belong WHERE username='" + user + "' AND name='" + petname + "';";
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

