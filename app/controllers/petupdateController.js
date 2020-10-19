const dbController = require('./dbController');
const userController = require('./userController');


exports.trackPet = function(req, callback) {
    const user = userController.getUser().getUsername();
    const { petname } = req.params;
    const query = "SELECT h.rtype, h.requirement" +
                    " FROM own_pet_belong o LEFT JOIN has h ON o.username = h.username" +
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


exports.editPet = function(requestBody, requestParam, callback) {
    const user = userController.getUser().getUsername();
    const { petname } = requestParam;
    var modifiedfields = '';
    var updated = '';
    console.log("Name: " + requestBody.name + " Diet: " + requestBody.diet + " Walk: " + requestBody.walk);

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