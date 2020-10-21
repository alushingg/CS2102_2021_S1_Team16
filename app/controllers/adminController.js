const dbController = require('./dbController');
const userController = require('./userController');

exports.showProfile = function(callback) {
	const user = userController.getUser().getUsername();
  	const query = "SELECT u.username, u.password, u.name, u.phone_number, u.area, a.position " 
				+ "FROM users u NATURAL JOIN pcs_admin a "
				+ "WHERE a.username = '" + user + "';";
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

exports.getMonthlyCtReport = function(month, year, callback) {
    const query = "SELECT * FROM ct_report WHERE month = " + month + " AND year = " + year + ";";
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

exports.getMonthlyReport = function(month, year, callback) {
    const query = "SELECT COALESCE(SUM(transactions), 0) AS total_transactions, COALESCE(SUM(pets), 0) AS total_pets, COALESCE(SUM(pet_days), 0) AS total_pet_days, "
                    + "COALESCE(SUM(salary), 0) AS total_salary, COALESCE(SUM(earnings), 0) AS total_earnings "
                + "FROM ct_report WHERE month = " + month + " AND year = " + year + ";";
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

exports.getMthSummary = function(callback) {
    const query = "SELECT to_char(to_timestamp (r.month::TEXT, 'MM'), 'Mon') AS month, r.year, SUM(r.transactions) AS total_transactions, "
                    + "SUM(r.pets) AS total_pets, SUM(r.pet_days) AS total_pet_days, "
                    + "CAST(SUM(r.salary) AS DECIMAL(100,2)) AS total_salary, CAST(SUM(r.earnings) AS DECIMAL(100,2)) AS total_earnings, "
                    + "CAST((SUM(r.earnings) - SUM(r.salary)) AS DECIMAL(100,2)) AS profit "
                + "FROM ct_report r "
                + "WHERE (r.year = EXTRACT(year FROM now()) AND r.month < EXTRACT(month FROM now())) "
                    + "OR (r.year = EXTRACT(year FROM now()) - 1 AND r.month >= EXTRACT(month FROM now())) "
                + "GROUP BY (r.month, r.year) "
                + "ORDER BY (r.year, r.month) ASC;";
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

exports.getSummary = function(callback) {
    const query = "SELECT to_char(to_timestamp (month::TEXT, 'MM'), 'Mon') AS tmonth, year AS tyear, SUM(transactions) AS transactions "
                + "FROM ct_report "
                + "WHERE (year = EXTRACT(year FROM now()) AND month < EXTRACT(month FROM now())) "
                    + "OR (year = EXTRACT(year FROM now()) - 1 AND month >= EXTRACT(month FROM now())) "
                + "GROUP BY (month, year) "
                + "ORDER BY (SUM(transactions), year, month) DESC "
                + "LIMIT 1; "
                + "SELECT to_char(to_timestamp (month::TEXT, 'MM'), 'Mon') AS pmonth, year AS pyear, SUM(pets) AS pets "
                + "FROM ct_report "
                + "WHERE (year = EXTRACT(year FROM now()) AND month < EXTRACT(month FROM now())) "
                    + "OR (year = EXTRACT(year FROM now()) - 1 AND month >= EXTRACT(month FROM now())) "
                + "GROUP BY (month, year) "
                + "ORDER BY (SUM(pets), year, month) DESC "
                + "LIMIT 1; "
                + "SELECT to_char(to_timestamp (month::TEXT, 'MM'), 'Mon') AS pdmonth, year AS pdyear, SUM(pet_days) AS pet_days "
                + "FROM ct_report "
                + "WHERE (year = EXTRACT(year FROM now()) AND month < EXTRACT(month FROM now())) "
                    + "OR (year = EXTRACT(year FROM now()) - 1 AND month >= EXTRACT(month FROM now())) "
                + "GROUP BY (month, year) "
                + "ORDER BY (SUM(pet_days), year, month) DESC "
                + "LIMIT 1; "
                + "SELECT to_char(to_timestamp (month::TEXT, 'MM'), 'Mon') AS smonth, year AS syear, SUM(salary) AS salary "
                + "FROM ct_report "
                + "WHERE (year = EXTRACT(year FROM now()) AND month < EXTRACT(month FROM now())) "
                    + "OR (year = EXTRACT(year FROM now()) - 1 AND month >= EXTRACT(month FROM now())) "
                + "GROUP BY (month, year) "
                + "ORDER BY (SUM(salary), year, month) DESC "
                + "LIMIT 1; "
                + "SELECT to_char(to_timestamp (month::TEXT, 'MM'), 'Mon') AS emonth, year AS eyear, SUM(earnings) AS earnings "
                + "FROM ct_report "
                + "WHERE (year = EXTRACT(year FROM now()) AND month < EXTRACT(month FROM now())) "
                    + "OR (year = EXTRACT(year FROM now()) - 1 AND month >= EXTRACT(month FROM now())) "
                + "GROUP BY (month, year) "
                + "ORDER BY (SUM(earnings), year, month) DESC "
                + "LIMIT 1; "
                + "SELECT to_char(to_timestamp (month::TEXT, 'MM'), 'Mon') AS pfmonth, year AS pfyear, (SUM(earnings) - SUM(salary)) AS profit "
                + "FROM ct_report "
                + "WHERE (year = EXTRACT(year FROM now()) AND month < EXTRACT(month FROM now())) "
                    + "OR (year = EXTRACT(year FROM now()) - 1 AND month >= EXTRACT(month FROM now())) "
                + "GROUP BY (month, year) "
                + "ORDER BY ((SUM(earnings) - SUM(salary)), year, month) DESC "
                + "LIMIT 1;";
    dbController.queryGet(query, (result) => {
        if(result.status == 200) {
            callback(result.body[0].rows, result.body[1].rows, result.body[2].rows, result.body[3].rows, result.body[4].rows, result.body[5].rows);
        } else {
            console.log("Failed.");
            console.log("Status code: " + result.status);
            callback([]);
        }
    });
};

exports.addAdmin = function(requestBody, callback) {
    const user = userController.getUser().getUsername();
    console.log("Username: " + requestBody.username + " Pwd: "+ requestBody.password +
            " Name: " + requestBody.name + " Phone: " + requestBody.phone +
            " Area: " + requestBody.area + " Position: " + requestBody.position);
    var added = `INSERT INTO users VALUES('${requestBody.username}', '${requestBody.password}', '${requestBody.name}',` +
                `'${requestBody.phone}', '${requestBody.area}');` +
                `INSERT INTO pcs_admin VALUES('${requestBody.username}', '${requestBody.position}');`
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
