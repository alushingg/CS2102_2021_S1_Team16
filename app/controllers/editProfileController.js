const dbController = require('./dbController');
const userController = require('./userController');

exports.showCurrentProfile = function(callback) {
	const user = userController.getUser().getUsername();
  	const query = "SELECT u.username, u.password, u.name, u.phone_number, u.area, p.credit_card " 
				+ "FROM users u NATURAL JOIN pet_owner p "
				+ "WHERE u.username = '" + user + "';"
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

exports.editProfile = function(requestBody, callback) {
    const user = userController.getUser().getUsername();
    var query ='';
    var modifiedfields = '';
    var updated = '';
    var count = 0;
    console.log("Name: " + requestBody.name + " Password: " + requestBody.password + " Phone: " + requestBody.phone + " area: " + requestBody.area + "Credit Card: " + requestBody.creditcard);
    if (requestBody.name) {
        count = count + 1;
        console.log("Name: " + requestBody.name)
        updated = updated + "'" + requestBody.name + "'";
        modifiedfields = modifiedfields + 'name';
    }
    if (requestBody.password) {
        count = count + 1;
        if (updated.length != 0) {
            updated = updated + ', ';
            modifiedfields = modifiedfields + ', ';
        }
        updated = updated + "'" + requestBody.password + "'";
        modifiedfields = modifiedfields + 'password';
    }
    if (requestBody.phone) {
        count = count + 1;
        if (updated.length != 0) {
            updated = updated + ', ';
            modifiedfields = modifiedfields + ', ';
        }
        updated = updated + "'" + requestBody.phone + "'";
        modifiedfields = modifiedfields + 'phone_number';
    }
    if (requestBody.area) {
        count = count + 1;
        if (updated.length != 0) {
            updated = updated + ', ';
            modifiedfields = modifiedfields + ', ';
        }
        updated = updated + "'" + requestBody.area + "'";
        modifiedfields = modifiedfields + 'area';
    }
    if (count > 1) {
        modifiedfields = "(" + modifiedfields + ")";
        updated = "(" + updated + ")";
    }

    if (requestBody.creditcard) {
        query = "UPDATE pet_owner SET" + " credit_card = " + requestBody.creditcard + " WHERE username= '" + user + "';"
    }

    query = query + "UPDATE users SET" + " " + modifiedfields + " = " + updated + " WHERE username= '" + user + "';"
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




