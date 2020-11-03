const dbController = require('./dbController');

exports.showProfile = function(username, callback) {
  	const query = "SELECT u.username, u.password, u.name, u.phone_number, u.area, p.credit_card " 
				+ "FROM users u NATURAL JOIN pet_owner p "
				+ "WHERE u.username = '" + username + "';";
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

exports.showPet = function(username, callback) {
    const query = "SELECT DISTINCT o.name, o.type, h.rtype, h.requirement "
                + "FROM own_pet_belong o LEFT JOIN has h ON o.name = h.name "
                + "WHERE o.username = '" + username + "';";
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

exports.showPastOrders = function(username, callback) {
	const query = "SELECT name, EXTRACT(day FROM start_date) as start_day, EXTRACT(month FROM start_date) as start_month, EXTRACT(year FROM start_date) as start_year, "
				+ "EXTRACT(day FROM end_date) as end_day, EXTRACT(month FROM end_date) as end_month, EXTRACT(year FROM end_date) as end_year, "
				+ "ctuname, "
				+ "(CASE WHEN has_paid THEN 'Has Paid' ELSE 'Unpaid' END) as has_paid, "
				+ "CAST(daily_price AS DECIMAL(100,2)) AS daily_price, is_completed, review, rating, transfer_method, payment_mode "
				+ "FROM take_care "
				+ "WHERE username = '" + username + "' "
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

exports.showOrder = function(req, callback) {
    const { name, day, month, year, ctuname} = req.params;
    const query = "SELECT EXTRACT(day FROM start_date) as start_day, EXTRACT(month FROM start_date) as start_month, EXTRACT(year FROM start_date) as start_year, "
        + "CAST(daily_price AS DECIMAL(100,2)) AS daily_price, transfer_method, payment_mode "
        + "FROM take_care "
        + "WHERE username = '" + req.session.user.username + "' AND name = '" + name + "' AND end_date = date '"
        + year + "-" + month + "-" + day + "' AND ctuname = '" + ctuname + "';";
    dbController.queryGet(query, (result) => {
        if(result.status == 200) {
            console.log(query);
            callback(result.body.rows, name, day, month, year, ctuname);
        } else {
            console.log("Failed.");
            console.log("Status code: " + result.status);
            callback([], "");
        }
    });
}

exports.postReview = function(username, requestBody, requestParam, callback) {
    const { name, day, month, year, ctuname} = requestParam;
    console.log("Name: " + name + " end date: " + year + "-" + month + "-" + day + " ctuname: " + ctuname + " rating:" + requestBody.rating + "review: " + requestBody.review);
    const query = "UPDATE take_care SET (review, rating) =" + "('" + requestBody.review + "', " + requestBody.rating
        + ") WHERE username = '" + username + "' AND name = '" + name + "' AND end_date = date '"
        + year + "-" + month + "-" + day + "' AND ctuname = '" + ctuname + "';";
    console.log("Query: " + query);
    dbController.queryGet(query, (result) => {
        if(result.status == 200) {
            const query1 = "SELECT AVG(rating) FROM take_care t WHERE t.ctuname = '" + ctuname + "';";
            dbController.queryGet(query1, (result) => {
                if(result.status == 200) {
                    console.log(query1);
                    const rating = result.body.rows[0].avg;
                    if (rating < 4) {
                        const query2 = "UPDATE can_care SET price = NULL WHERE username = '" + ctuname + "';";
                        dbController.queryGet(query2, (result) => {
                            if (result.status == 200) {
                                console.log(query2);
                                callback(result.body.rows);
                            } else {
                                console.log("Failed.");
                                console.log("Status code: " + result.status);
                                callback([]);
                            }
                        });
                    }
                    callback(result.body.rows);
                } else {
                    console.log("Failed.");
                    console.log("Status code: " + result.status);
                    callback([]);
                }
            });
            callback(result.body.rows);
        } else {
            console.log("Failed.");
            console.log("Status code: " + result.status);
            callback([]);
        }
    });
}
