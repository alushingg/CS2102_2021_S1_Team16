const dbController = require('./dbController');
const userController = require('./userController');

exports.showProfile = function(callback) {
	const user = userController.getUser().getUsername();
  	const query = "SELECT u.username, u.password, u.name, u.phone_number, u.area, p.credit_card " 
				+ "FROM users u NATURAL JOIN pet_owner p "
				+ "WHERE u.username = '" + user + "';";
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
    const query = "SELECT DISTINCT o.name, o.type, h.rtype, h.requirement "
                + "FROM own_pet_belong o LEFT JOIN has h ON o.name = h.name "
                + "WHERE o.username = '" + user + "';";
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

exports.showPastOrders = function(callback) {
	const user = userController.getUser().getUsername();
	const query = "SELECT name, EXTRACT(day FROM start_date) as start_day, EXTRACT(month FROM start_date) as start_month, EXTRACT(year FROM start_date) as start_year, "
				+ "EXTRACT(day FROM end_date) as end_day, EXTRACT(month FROM end_date) as end_month, EXTRACT(year FROM end_date) as end_year, "
				+ "ctuname, has_paid, daily_price, review, rating, transfer_method, payment_mode "
				+ "FROM take_care "
				+ "WHERE username = '" + user + "' "
                + "ORDER BY (start_date, end_date) DESC;";
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
