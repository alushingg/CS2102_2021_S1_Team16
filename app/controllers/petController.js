const dbController = require('./dbController');

exports.trackPet = function(req, callback) {
    const { petname } = req.params;
    const query = "SELECT h.rtype, h.requirement" +
                    " FROM own_pet_belong o NATURAL JOIN has h" +
                    " WHERE o.username = '" + req.session.user.username + "' AND o.name = '" + petname + "';";
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

exports.addPet = function(username, requestBody, callback) {
    
    console.log("Name: " + requestBody.petname + " Type: "+ requestBody.type +
            " Diet: " + requestBody.diet + " Walk: " + requestBody.walk);
    var added = "INSERT INTO own_pet_belong VALUES ('" + username + "', '" + requestBody.petname + "', '" +
                requestBody.type + "');";

    if (requestBody.diet) {
        if (Array.isArray(requestBody.diet)) {
            for (var i = 0; i < requestBody.diet.length; i++) {
                added = added + " INSERT INTO has VALUES ('" + username + "', '" + requestBody.petname + "', 'diet', '" +
                        requestBody.diet[i] + "');";
            }
        } else {
            added = added + " INSERT INTO has VALUES ('" + username + "', '" + requestBody.petname + "', 'diet', '" +
                    requestBody.diet + "');";

        }
    }

    if (requestBody.walk != "None") {
        added = added + " INSERT INTO has VALUES ('" + username + "', '" + requestBody.petname + "', 'walk', '" +
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

exports.editPet = function(username, requestBody, requestParam, callback) {
    const { petname } = requestParam;
    var modifiedfields = '';
    var updated = '';
    console.log("Name: " + petname + " Diet: " + requestBody.diet + " Walk: " + requestBody.walk);

    updated = "DELETE FROM has WHERE username='" + username + "' AND name='" + petname + "';";
    if (requestBody.diet) {
        if (Array.isArray(requestBody.diet)) {
            for (var i = 0; i < requestBody.diet.length; i++) {
                updated = updated + " INSERT INTO has VALUES ('" + username + "', '" + petname + "', 'diet', '" +
                        requestBody.diet[i] + "');";
            }
        } else {
            updated = updated + " INSERT INTO has VALUES ('" + username + "', '" + petname + "', 'diet', '" +
                    requestBody.diet + "');";

        }
    }
    if (requestBody.walk != 'None') {
        updated = updated + "INSERT INTO has VALUES ('" + username + "', '" + petname + "', 'walk', '"
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
    console.log("Name: " + petname);

    const query = "DELETE from own_pet_belong WHERE username='" + req.session.user.username + "' AND name='" + petname + "';";
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

