const dbController = require('./dbController');
const userController = require('./userController');

exports.showProfile = function(user, callback) {
  	const query = "SELECT u.username, u.name, u.phone_number, u.area, CAST(ratings.rating AS DECIMAL(3, 2)), "
				    + "CASE "
				    	+ "WHEN u.username IN (SELECT username FROM part_time) THEN 'Part Time' "
				        + "ELSE 'Full Time' "
				    + "END AS job_type "
				+ "FROM care_taker c natural join users u LEFT JOIN "
					+ "(SELECT t.ctuname AS username, AVG(t.rating) AS rating FROM take_care t GROUP BY t.ctuname) AS ratings ON c.username = ratings.username "
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

exports.showPricing = function(user, callback) {
  	const query = "SELECT type, COALESCE(price, base_price) as price "
				+ " FROM can_care NATURAL JOIN category "
				+ " WHERE username = '" + user + "';";
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

exports.showAvailability = function(user, callback) {
  	const query = "(SELECT EXTRACT(day FROM date) AS day, EXTRACT(month FROM date) AS month, EXTRACT(year FROM date) AS year "
  				+ "FROM apply_leave WHERE username = '" + user + "' "
				+ "ORDER BY date) "
				+ "UNION "
				+ "(SELECT EXTRACT(day FROM date) AS day, EXTRACT(month FROM date) AS month, EXTRACT(year FROM date) AS year "
				+ "FROM specify_availability WHERE username = '" + user + "' "
				+ "ORDER BY date);";
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

exports.showReview = function(user, callback) {
  	const query = "SELECT t.username, t.review "
				+ "FROM take_care t"
				+ "WHERE t.ctuname = '" + user + "' AND t.review IS NOT NULL;";
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
	const query = "SELECT t.username AS username, t.name AS name, EXTRACT(day FROM start_date) as start_day, EXTRACT(month FROM start_date) as start_month, EXTRACT(year FROM start_date) as start_year,"
      + "EXTRACT(day FROM end_date) as end_day, EXTRACT(month FROM end_date) as end_month, EXTRACT(year FROM end_date) as end_year, t.has_paid, t.is_completed, t.review AS review, t.rating AS rating  "
				+ "FROM take_care t JOIN care_taker c ON t.ctuname = c.username "
        +"WHERE c.username = '" + user + "' ;";
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

exports.showPetdays = function(callback) {
	const user = userController.getUser().getUsername();
	const query = "SELECT SUM(x.petdays) as totalpetdays "
             + "FROM (SELECT c.username AS ctuname, t.start_date AS start, t.end_date AS end, t.end_date - t.start_date + 1  AS petdays "
               +"FROM take_care t JOIN care_taker c ON t.ctuname = c.username WHERE EXTRACT(month FROM(now())) = EXTRACT(month FROM (start_date)) AND EXTRACT(month FROM(now())) = EXTRACT(month FROM(end_date))) AS x "
             +"WHERE x.ctuname = '"+ user +"'  GROUP BY x.ctuname;  ";
  	dbController.queryGet(query, (result) => {
        if(result.status == 200) {
            callback(result.body.rows);
        } else {
            console.log("Failed.!");
            console.log("Status code: " + result.status);
            callback([]);
        }
    });
};

exports.updatePaid = function(req, callback) {
    //'/ct/:name/:pouname/:day/:month/:year/paid
    const {name, pouname, day, month, year} = req.params;
    const user = userController.getUser().getUsername();
    query = "UPDATE take_care SET has_paid = TRUE WHERE username = '" + pouname + "' AND name = '" + name + "' AND end_date = date '"
        + year + "-" + month + "-" + day + "' AND ctuname = '" + user + "';";
    dbController.queryGet(query, (result) => {
            if(result.status == 200) {
                callback(result.body.rows);
            } else {
                console.log("Failed.!");
                console.log("Status code: " + result.status);
                callback([]);
            }
        });
}

exports.updateCompleted = function(req, callback) {
    //'/ct/:name/:pouname/:day/:month/:year/paid
    const {name, pouname, day, month, year} = req.params;
    const user = userController.getUser().getUsername();
    query = "UPDATE take_care SET is_completed = TRUE WHERE username = '" + pouname + "' AND name = '" + name + "' AND end_date = date '"
        + year + "-" + month + "-" + day + "' AND ctuname = '" + user + "';";
    dbController.queryGet(query, (result) => {
         if(result.status == 200) {
             callback(result.body.rows);
         } else {
             console.log("Failed.!");
             console.log("Status code: " + result.status);
             callback([]);
         }
     });
}
