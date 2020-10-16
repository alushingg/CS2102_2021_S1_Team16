const dbController = require('./dbController');
const userController = require('./userController');

exports.showProfile = function(callback) {
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

exports.showPet = function(callback) {
	const user = userController.getUser().getUsername();
	const query = "SELECT DISTINCT o.name, o.type "
				+ "FROM own_pet_belong o NATURAL JOIN has h "
				+ "WHERE o.username = '" + user + "';"
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
