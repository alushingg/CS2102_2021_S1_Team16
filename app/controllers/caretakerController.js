const dbController = require('./dbController');

exports.showProfile = function(username, callback) {
  	const query = "SELECT u.username, u.name, u.phone_number, u.area, CAST(ratings.rating AS DECIMAL(3, 2)), "
				    + "CASE "
				    	+ "WHEN u.username IN (SELECT username FROM part_time) THEN 'Part Time' "
				        + "ELSE 'Full Time' "
				    + "END AS job_type "
				+ "FROM care_taker c natural join users u LEFT JOIN "
					+ "(SELECT t.ctuname AS username, AVG(t.rating) AS rating FROM take_care t GROUP BY t.ctuname) AS ratings ON c.username = ratings.username "
				+ "WHERE u.username = '" + username + "';"
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

exports.showPricing = function(username, callback) {
  	const query = "SELECT type, CAST(COALESCE(price, base_price) AS DECIMAL(100,2)) as price "
				+ " FROM can_care NATURAL JOIN category "
				+ " WHERE username = '" + username + "';";
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

exports.addAvailability = function(username, requestBody, callback) {
    var query1 = `SELECT p.username FROM part_time p WHERE p.username = '${username}';`;
    dbController.queryGet(query1, (result) => {
  //  console.log(query1);
    if(result.body.rows.length != 0){ // is part timer
      const query = `INSERT INTO specify_availability VALUES ('${username}', DATE('${requestBody.year}-${requestBody.month}-${requestBody.day}'));`;
      console.log("Query: " + query);
      dbController.queryGet(query, (result) => {
          if(result.status == 200) {
              callback("Success!");
          } else {
              console.log("Failed.");
              console.log("Status code: " + result.status);
              callback(result.err.message);
            }
        });
    }
    else {
        callback("This user does not work part time");
      }
  });
}

exports.applyleave = function(username, requestBody, callback) {
   var query1 = `SELECT f.username FROM full_time f WHERE f.username = '${username}';`;
   dbController.queryGet(query1, (result) => {
  //  console.log(query1);
   if(result.body.rows.length != 0){ // is full timer
     const query = `INSERT INTO apply_leave VALUES ('${username}', DATE('${requestBody.year}-${requestBody.month}-${requestBody.day}'), '${requestBody.reason}');`;
     console.log("Query: " + query);
     dbController.queryGet(query, (result) => {
         if(result.status == 200) {
             callback("Success!");
         } else {
             console.log("Failed.");
             console.log("Status code: " + result.status);
             callback(result.err.message);
           }
       });
   }
   else {
       callback("This user does not work full time");
     }
  });
}

exports.showAvailability = function(username, callback) {
  	const query = "SELECT EXTRACT(day FROM date) AS day, EXTRACT(month FROM date) AS month, EXTRACT(year FROM date) AS year, reason "
  			+ "FROM apply_leave WHERE username = '" + username + "' "
				+ "UNION "
				+ "SELECT EXTRACT(day FROM date) AS day, EXTRACT(month FROM date) AS month, EXTRACT(year FROM date) AS year, NULL "
				+ "FROM specify_availability WHERE username = '" + username + "' "
				+ "ORDER BY year DESC, month DESC, day DESC;";
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

exports.showReview = function(username, callback) {
  	const query = "SELECT t.username, t.review, t.rating "
				+ "FROM take_care t "
				+ "WHERE t.ctuname = '" + username + "' AND t.review IS NOT NULL;";
  	dbController.queryGet(query, (result) => {
        if(result.status == 200) {
            console.log(result.body.rows);
            callback(result.body.rows);
        } else {
            console.log("Failed.");
            console.log("Status code: " + result.status);
            callback([]);
        }
    });
};

exports.showPastOrders = function(username, callback) {
	const query = "SELECT t.username AS username, t.name AS name, EXTRACT(day FROM start_date) as start_day, EXTRACT(month FROM start_date) as start_month, EXTRACT(year FROM start_date) as start_year,"
                + "EXTRACT(day FROM end_date) as end_day, EXTRACT(month FROM end_date) as end_month, EXTRACT(year FROM end_date) as end_year, t.has_paid, t.is_completed, t.review AS review, t.rating AS rating  "
				+ "FROM take_care t JOIN care_taker c ON t.ctuname = c.username "
                + "WHERE c.username = '" + username + "' " 
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

exports.showSummary = function(username, callback) {
  const query = "SELECT COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                    + "SUM(t.end_date - t.start_date + 1) AS pet_days, 3000.00 AS salary "
                + "FROM full_time f INNER JOIN "
                    + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                    + "ON f.username = t.ctuname "
                + "WHERE t.ctuname = '" + username + "' "
                    + "AND t.emonth = EXTRACT(month FROM NOW()) AND t.eyear = EXTRACT(year FROM NOW()) "
                + "GROUP BY (f.username, t.emonth, t.eyear) "
                + "HAVING COUNT(*) <= 60 "
                + "UNION "
                + "SELECT COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                    + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                    + "CAST((3000 + (SELECT SUM(0.8 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                                + "WHERE t1.ctuname = f.username "
                                    + "AND EXTRACT(month FROM t1.end_date) = t.emonth "
                                    + "AND EXTRACT(year FROM t1.end_date) = t.eyear "
                                + "GROUP BY (t1.start_date, t1.end_date) "
                                + "ORDER BY t1.end_date ASC, t1.start_date ASC "
                                + "OFFSET 60)) AS DECIMAL(100,2)) AS salary "
                + "FROM full_time f INNER JOIN "
                    + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                    + "ON f.username = t.ctuname "
                + "WHERE t.ctuname = '" + username + "' "
                    + "AND t.emonth = EXTRACT(month FROM NOW()) AND t.eyear = EXTRACT(year FROM NOW()) "
                + "GROUP BY (f.username, t.emonth, t.eyear) "
                + "HAVING COUNT(*) > 60 "
                + "UNION "
                + "SELECT COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                    + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                    + "CAST((SELECT SUM(0.75 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                        + "WHERE t1.ctuname = p.username "
                            + "AND EXTRACT(month FROM t1.end_date) = t.emonth "
                            + "AND EXTRACT(year FROM t1.end_date) = t.eyear) AS DECIMAL(100,2)) AS salary "
                + "FROM part_time p INNER JOIN "
                    + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                    + "ON p.username = t.ctuname "
                + "WHERE t.ctuname = '" + username + "' "
                    + "AND t.emonth = EXTRACT(month FROM NOW()) AND t.eyear = EXTRACT(year FROM NOW()) "
                + "GROUP BY (p.username, t.emonth, t.eyear);";
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
    const {name, pouname, day, month, year} = req.params;
    query = "UPDATE take_care SET has_paid = TRUE WHERE username = '" + pouname + "' AND name = '" + name + "' AND end_date = date '"
        + year + "-" + month + "-" + day + "' AND ctuname = '" + req.session.user.username + "';";
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
    const {name, pouname, day, month, year} = req.params;
    query = "UPDATE take_care SET is_completed = TRUE WHERE username = '" + pouname + "' AND name = '" + name + "' AND end_date = date '"
        + year + "-" + month + "-" + day + "' AND ctuname = '" + req.session.user.username + "';";
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
