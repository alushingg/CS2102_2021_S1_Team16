const dbController = require('./dbController');

exports.showCurrentPOProfile = function(username, callback) {
  	const query = "SELECT u.username, u.password, u.name, u.phone_number, u.area, p.credit_card "
				+ "FROM users u NATURAL JOIN pet_owner p "
				+ "WHERE u.username = '" + username + "';"
  	dbController.queryGet(query, (result) => {
        if(result.status == 200) {
            callback([result.body.rows, 'Owner']);
        } else {
            console.log("Failed.");
            console.log("Status code: " + result.status);
            callback([]);
        }
    });
};

exports.showCurrentAdminProfile = function(username, callback) {

    const query = "SELECT u.username, u.password, u.name, u.phone_number, u.area, a.position "
        + "FROM users u NATURAL JOIN pcs_admin a "
        + "WHERE u.username = '" + username + "';"
    dbController.queryGet(query, (result) => {
        if(result.status == 200) {
            callback([result.body.rows, 'Admin']);
        } else {
            console.log("Failed.");
            console.log("Status code: " + result.status);
            callback([]);
        }
    });
};
exports.showCurrentCaretakerProfile = function(username, callback) {
  	const query = "SELECT u.username, u.password, u.name, u.phone_number, u.area "
				+ "FROM users u NATURAL JOIN care_taker c "
				+ "WHERE u.username = '" + username + "';"
  	dbController.queryGet(query, (result) => {
        if(result.status == 200) {
            callback([result.body.rows, 'Caretaker']);
        } else {
            console.log("Failed.");
            console.log("Status code: " + result.status);
            callback([]);
        }
    });
};

exports.editPOProfile = function(username, requestBody, callback) {
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
        updated = updated + requestBody.phone;
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
        query = "UPDATE pet_owner SET" + " credit_card = " + requestBody.creditcard + " WHERE username= '" + username + "';"
    } else {
        query = "UPDATE pet_owner SET" + " credit_card = NULL WHERE username= '" + username + "';"

    }

    if (count > 0) {
        query = query + "UPDATE users SET" + " " + modifiedfields + " = " + updated + " WHERE username= '" + username + "';"
    }

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

exports.editAdminProfile = function(username, requestBody, callback) {
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

    if (requestBody.position) {
        query = "UPDATE pcs_admin SET" + " position = '" + requestBody.position + "' WHERE username= '" + username + "';"
    }

    if (count > 1) {
        modifiedfields = "(" + modifiedfields + ")";
        updated = "(" + updated + ")";
    }

    if (count > 0) {
        query = query + "UPDATE users SET" + " " + modifiedfields + " = " + updated + " WHERE username= '" + username + "';"
    }
		console.log("Query: " + query);
			dbController.queryGet(query, (result) => {
					if (result.status == 200) {
							callback(result.body.rows);
					} else {
							console.log("Failed.");
							console.log("Status code: " + result.status);
							callback([]);
					}
			});
	}

	exports.editCaretakerProfile = function(username, requestBody, callback) {
	    var query ='';
	    var modifiedfields = '';
	    var updated = '';
	    var count = 0;
	    console.log("Name: " + requestBody.name + " Password: " + requestBody.password + " Phone: " + requestBody.phone + " area: " + requestBody.area);
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
	        updated = updated + requestBody.phone;
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
			if (count > 0) {
					query = query + "UPDATE users SET" + " " + modifiedfields + " = " + updated + " WHERE username= '" + username + "';"
			}

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

exports.deleteProfile = function(username, callback) {
    console.log("Delete Profile")
    const query = "DELETE" + " FROM users WHERE username = '" + username + "';"
    console.log("Query: " + query)
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

exports.addType = function(username, requestBody, callback) {
    const query = "INSERT INTO can_care VALUES ('" + username + "', '" + requestBody.type + "', NULL);";
    console.log("Query: " + query)
    dbController.queryGet(query, (result) => {
        if(result.status == 200) {
            callback(result.body.rows, "");
        } else {
            console.log("Failed.");
            console.log("Status code: " + result.status);
            callback([], result.err.message);
        }
    });
};

exports.setPrice = function(username, requestBody, type, callback) {
    const query = `SELECT base_price FROM category WHERE type = '${type}';`;
    console.log("Query: " + query)
    dbController.queryGet(query, (result) => {
        if(result.status == 200) {
            if (parseFloat(result.body.rows[0].base_price) > parseFloat(requestBody.price)) {
                callback([], "Price should be higher than base price!");
            } else {
                const query1 = `UPDATE can_care SET price = ${requestBody.price} WHERE username = '${username}' AND type = '${type}';`;
                dbController.queryGet(query1, (result) => {
                    if(result.status == 200) {
                        callback(result.body.rows, "");
                    } else {
                        console.log("Failed.");
                        console.log("Status code: " + result.status);
                        callback([], result.err.message);
                    }
                });
            }
        } else {
            console.log("Failed.");
            console.log("Status code: " + result.status);
            callback([], result.err.message);
        }
    });
};

