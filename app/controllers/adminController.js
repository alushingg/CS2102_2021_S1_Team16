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
    const query = "SELECT f.username, 'Full Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                    + "SUM(t.end_date - t.start_date + 1) AS pet_days, 3000 AS salary "
                + "FROM full_time f INNER JOIN take_care t ON f.username = t.ctuname "
                + "WHERE has_paid "
                    + "AND EXTRACT(month FROM t.end_date) = " + month + " "
                    + "AND EXTRACT(year FROM t.end_date) = " + year + " "
                + "GROUP BY f.username "
                + "HAVING COUNT(*) <= 60 "
                + "UNION "
                + "SELECT f.username, 'Full Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                    + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                    + "(3000 + (SELECT SUM(0.8 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                                + "WHERE t1.ctuname = f.username "
                                    + "AND has_paid "
                                    + "AND EXTRACT(month FROM t1.end_date) = " + month + " "
                                    + "AND EXTRACT(year FROM t1.end_date) = " + year + " "
                                + "GROUP BY (t1.start_date, t1.end_date) "
                                + "ORDER BY t1.end_date ASC, t1.start_date ASC "
                                + "OFFSET 60)) AS salary "
                + "FROM full_time f INNER JOIN take_care t ON f.username = t.ctuname "
                + "WHERE has_paid "
                    + "AND EXTRACT(month FROM t.end_date) = " + month + " "
                    + "AND EXTRACT(year FROM t.end_date) = " + year + " "
                + "GROUP BY f.username "
                + "HAVING COUNT(*) > 60 "
                + "UNION "
                + "SELECT p.username, 'Part Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                    + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                    + "(SELECT SUM(0.75 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                        + "WHERE t1.ctuname = p.username "
                            + "AND has_paid "
                            + "AND EXTRACT(month FROM t1.end_date) = " + month + " "
                            + "AND EXTRACT(year FROM t1.end_date) = " + year + ") AS salary "
                + "FROM part_time p INNER JOIN take_care t ON p.username = t.ctuname "
                + "WHERE has_paid "
                    + "AND EXTRACT(month FROM t.end_date) = " + month + " "
                    + "AND EXTRACT(year FROM t.end_date) = " + year + " "
                + "GROUP BY p.username;";
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
    const query = "WITH ct_report AS "
                    + "(SELECT f.username, 'Full Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, 3000 AS salary "
                    + "FROM full_time f INNER JOIN take_care t ON f.username = t.ctuname "
                    + "WHERE has_paid "
                        + "AND EXTRACT(month FROM t.end_date) = " + month + " "
                        + "AND EXTRACT(year FROM t.end_date) = " + year + " "
                    + "GROUP BY f.username "
                    + "HAVING COUNT(*) <= 60 "
                    + "UNION "
                    + "SELECT f.username, 'Full Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                        + "(3000 + (SELECT SUM(0.8 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                                    + "WHERE t1.ctuname = f.username "
                                        + "AND has_paid "
                                        + "AND EXTRACT(month FROM t1.end_date) = " + month + " "
                                        + "AND EXTRACT(year FROM t1.end_date) = " + year + " "
                                    + "GROUP BY (t1.start_date, t1.end_date) "
                                    + "ORDER BY t1.end_date ASC, t1.start_date ASC "
                                    + "OFFSET 60)) AS salary "
                    + "FROM full_time f INNER JOIN take_care t ON f.username = t.ctuname "
                    + "WHERE has_paid "
                        + "AND EXTRACT(month FROM t.end_date) = " + month + " "
                        + "AND EXTRACT(year FROM t.end_date) = " + year + " "
                    + "GROUP BY f.username "
                    + "HAVING COUNT(*) > 60 "
                    + "UNION "
                    + "SELECT p.username, 'Part Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                        + "(SELECT SUM(0.75 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                            + "WHERE t1.ctuname = p.username "
                                + "AND has_paid "
                                + "AND EXTRACT(month FROM t1.end_date) = " + month + " "
                                + "AND EXTRACT(year FROM t1.end_date) = " + year + ") AS salary "
                    + "FROM part_time p INNER JOIN take_care t ON p.username = t.ctuname "
                    + "WHERE has_paid "
                        + "AND EXTRACT(month FROM t.end_date) = " + month + " "
                        + "AND EXTRACT(year FROM t.end_date) = " + year + " "
                    + "GROUP BY p.username) "
                + "SELECT COALESCE(SUM(transactions), 0) AS total_transactions, COALESCE(SUM(pets), 0) AS total_pets, COALESCE(SUM(pet_days), 0) AS total_pet_days, "
                    + "COALESCE(SUM(salary), 0) AS total_salary, COALESCE((SELECT SUM(daily_price * (end_date - start_date + 1)) "
                                                    + "FROM take_care t "
                                                    + "WHERE has_paid "
                                                        + "AND EXTRACT(month FROM t.end_date) = " + month + " "
                                                        + "AND EXTRACT(year FROM t.end_date) = " + year + "), 0) AS earnings "
                + "FROM ct_report;";
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
