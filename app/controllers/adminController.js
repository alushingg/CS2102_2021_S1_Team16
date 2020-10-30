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
    // const query = "SELECT * FROM ct_report WHERE month = " + month + " AND year = " + year + ";";
    const query = "SELECT f.username, 'Full Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                    + "SUM(t.end_date - t.start_date + 1) AS pet_days, 3000.00 AS salary, "
                    + "CAST(SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS DECIMAL(100,2)) AS earnings, "
                    + "t.emonth AS month, t.eyear AS year "
                + "FROM full_time f INNER JOIN "
                    + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                    + "ON f.username = t.ctuname "
                + "WHERE t.emonth = " + month + " AND t.eyear = " + year + " AND t.has_paid AND t.is_completed "
                + "GROUP BY (f.username, t.emonth, t.eyear) "
                + "HAVING COUNT(*) <= 60 "
                + "UNION "
                + "SELECT f.username, 'Full Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                    + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                    + "CAST((3000 + (SELECT SUM(0.8 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                                + "WHERE t1.ctuname = f.username "
                                    + "AND has_paid "
                                    + "AND is_completed "
                                    + "AND EXTRACT(month FROM t1.end_date) = t.emonth "
                                    + "AND EXTRACT(year FROM t1.end_date) = t.eyear "
                                + "GROUP BY (t1.start_date, t1.end_date) "
                                + "ORDER BY t1.end_date ASC, t1.start_date ASC "
                                + "OFFSET 60)) AS DECIMAL(100,2)) AS salary, "
                    + "CAST(SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS DECIMAL(100,2)) AS earnings, "
                    + "t.emonth AS month, t.eyear AS year "
                + "FROM full_time f INNER JOIN "
                    + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                    + "ON f.username = t.ctuname "
                + "WHERE t.emonth = " + month + " AND t.eyear = " + year + " AND t.has_paid AND t.is_completed "
                + "GROUP BY (f.username, t.emonth, t.eyear) "
                + "HAVING COUNT(*) > 60 "
                + "UNION "
                + "SELECT p.username, 'Part Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                    + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                    + "CAST((SELECT SUM(0.75 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                        + "WHERE t1.ctuname = p.username "
                            + "AND has_paid AND is_completed "
                            + "AND EXTRACT(month FROM t1.end_date) = t.emonth "
                            + "AND EXTRACT(year FROM t1.end_date) = t.eyear) AS DECIMAL(100,2)) AS salary, "
                    + "CAST(SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS DECIMAL(100,2)) AS earnings, "
                    + "t.emonth AS month, t.eyear AS year "
                + "FROM part_time p INNER JOIN "
                    + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                    + "ON p.username = t.ctuname "
                + "WHERE t.emonth = " + month + " AND t.eyear = " + year + " AND t.has_paid AND t.is_completed "
                + "GROUP BY (p.username, t.emonth, t.eyear);";
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
    // const query = "SELECT COALESCE(SUM(transactions), 0) AS total_transactions, COALESCE(SUM(pets), 0) AS total_pets, COALESCE(SUM(pet_days), 0) AS total_pet_days, "
    //                 + "COALESCE(SUM(salary), 0) AS total_salary, COALESCE(SUM(earnings), 0) AS total_earnings "
    //             + "FROM ct_report WHERE month = " + month + " AND year = " + year + ";";
    const query = "SELECT COALESCE(SUM(r.transactions), 0) AS total_transactions, COALESCE(SUM(r.pets), 0) AS total_pets, COALESCE(SUM(r.pet_days), 0) AS total_pet_days, "
                    + "COALESCE(CAST(SUM(r.salary) AS DECIMAL(100,2)), 0) AS total_salary, COALESCE(CAST(SUM(r.earnings) AS DECIMAL(100,2)), 0) AS total_earnings, "
                    + "COALESCE(CAST((SUM(r.earnings) - SUM(r.salary)) AS DECIMAL(100,2)), 0) AS total_profit "
                + "FROM "
                    + "(SELECT f.username, 'Full Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, 3000 AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM full_time f INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON f.username = t.ctuname "
                    + "WHERE t.emonth = " + month + " AND t.eyear = " + year + " AND t.has_paid AND t.is_completed "
                    + "GROUP BY (f.username, t.emonth, t.eyear) "
                    + "HAVING COUNT(*) <= 60 "
                    + "UNION "
                    + "SELECT f.username, 'Full Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                        + "(3000 + (SELECT SUM(0.8 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                                    + "WHERE t1.ctuname = f.username "
                                        + "AND has_paid AND is_completed "
                                        + "AND EXTRACT(month FROM t1.end_date) = t.emonth "
                                        + "AND EXTRACT(year FROM t1.end_date) = t.eyear "
                                    + "GROUP BY (t1.start_date, t1.end_date) "
                                    + "ORDER BY t1.end_date ASC, t1.start_date ASC "
                                    + "OFFSET 60)) AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM full_time f INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON f.username = t.ctuname "
                    + "WHERE t.emonth = " + month + " AND t.eyear = " + year + " AND t.has_paid AND t.is_completed "
                    + "GROUP BY (f.username, t.emonth, t.eyear) "
                    + "HAVING COUNT(*) > 60 "
                    + "UNION "
                    + "SELECT p.username, 'Part Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                        + "(SELECT SUM(0.75 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                            + "WHERE t1.ctuname = p.username "
                                + "AND has_paid AND is_completed "
                                + "AND EXTRACT(month FROM t1.end_date) = t.emonth "
                                + "AND EXTRACT(year FROM t1.end_date) = t.eyear) AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM part_time p INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON p.username = t.ctuname "
                    + "WHERE t.emonth = " + month + " AND t.eyear = " + year + " AND t.has_paid AND t.is_completed "
                    + "GROUP BY (p.username, t.emonth, t.eyear)) AS r;";
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
    // const query = "SELECT to_char(to_timestamp (r.month::TEXT, 'MM'), 'Mon') AS month, r.year, SUM(r.transactions) AS total_transactions, "
    //                 + "SUM(r.pets) AS total_pets, SUM(r.pet_days) AS total_pet_days, "
    //                 + "CAST(SUM(r.salary) AS DECIMAL(100,2)) AS total_salary, CAST(SUM(r.earnings) AS DECIMAL(100,2)) AS total_earnings, "
    //                 + "CAST((SUM(r.earnings) - SUM(r.salary)) AS DECIMAL(100,2)) AS profit "
    //             + "FROM ct_report r "
    //             + "WHERE (r.year = EXTRACT(year FROM now()) AND r.month < EXTRACT(month FROM now())) "
    //                 + "OR (r.year = EXTRACT(year FROM now()) - 1 AND r.month >= EXTRACT(month FROM now())) "
    //             + "GROUP BY (r.month, r.year) "
    //             + "ORDER BY (r.year, r.month) ASC;";
    const query = "SELECT to_char(to_timestamp (r.month::TEXT, 'MM'), 'Mon') AS month, r.year, SUM(r.transactions) AS total_transactions, "
                    + "SUM(r.pets) AS total_pets, SUM(r.pet_days) AS total_pet_days, "
                    + "CAST(SUM(r.salary) AS DECIMAL(100,2)) AS total_salary, CAST(SUM(r.earnings) AS DECIMAL(100,2)) AS total_earnings, "
                    + "CAST((SUM(r.earnings) - SUM(r.salary)) AS DECIMAL(100,2)) AS profit "
                + "FROM "
                    + "(SELECT f.username, 'Full Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, 3000 AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM full_time f INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON f.username = t.ctuname "
                    + "WHERE t.has_paid AND t.is_completed "
                    + "GROUP BY (f.username, t.emonth, t.eyear) "
                    + "HAVING COUNT(*) <= 60 "
                    + "UNION "
                    + "SELECT f.username, 'Full Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                        + "(3000 + (SELECT SUM(0.8 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                                    + "WHERE t1.ctuname = f.username "
                                        + "AND has_paid AND is_completed "
                                        + "AND EXTRACT(month FROM t1.end_date) = t.emonth "
                                        + "AND EXTRACT(year FROM t1.end_date) = t.eyear "
                                    + "GROUP BY (t1.start_date, t1.end_date) "
                                    + "ORDER BY t1.end_date ASC, t1.start_date ASC "
                                    + "OFFSET 60)) AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM full_time f INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON f.username = t.ctuname "
                    + "WHERE t.has_paid AND t.is_completed "
                    + "GROUP BY (f.username, t.emonth, t.eyear) "
                    + "HAVING COUNT(*) > 60 "
                    + "UNION "
                    + "SELECT p.username, 'Part Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                        + "(SELECT SUM(0.75 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                            + "WHERE t1.ctuname = p.username "
                                + "AND has_paid AND is_completed "
                                + "AND EXTRACT(month FROM t1.end_date) = t.emonth "
                                + "AND EXTRACT(year FROM t1.end_date) = t.eyear) AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM part_time p INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON p.username = t.ctuname "
                    + "WHERE t.has_paid AND t.is_completed "
                    + "GROUP BY (p.username, t.emonth, t.eyear)) AS r "
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
    // const query = "SELECT to_char(to_timestamp (month::TEXT, 'MM'), 'Mon') AS tmonth, year AS tyear, SUM(transactions) AS transactions "
    //             + "FROM ct_report "
    //             + "WHERE (year = EXTRACT(year FROM now()) AND month < EXTRACT(month FROM now())) "
    //                 + "OR (year = EXTRACT(year FROM now()) - 1 AND month >= EXTRACT(month FROM now())) "
    //             + "GROUP BY (month, year) "
    //             + "ORDER BY (SUM(transactions), year, month) DESC "
    //             + "LIMIT 1; "
    //             + "SELECT to_char(to_timestamp (month::TEXT, 'MM'), 'Mon') AS pmonth, year AS pyear, SUM(pets) AS pets "
    //             + "FROM ct_report "
    //             + "WHERE (year = EXTRACT(year FROM now()) AND month < EXTRACT(month FROM now())) "
    //                 + "OR (year = EXTRACT(year FROM now()) - 1 AND month >= EXTRACT(month FROM now())) "
    //             + "GROUP BY (month, year) "
    //             + "ORDER BY (SUM(pets), year, month) DESC "
    //             + "LIMIT 1; "
    //             + "SELECT to_char(to_timestamp (month::TEXT, 'MM'), 'Mon') AS pdmonth, year AS pdyear, SUM(pet_days) AS pet_days "
    //             + "FROM ct_report "
    //             + "WHERE (year = EXTRACT(year FROM now()) AND month < EXTRACT(month FROM now())) "
    //                 + "OR (year = EXTRACT(year FROM now()) - 1 AND month >= EXTRACT(month FROM now())) "
    //             + "GROUP BY (month, year) "
    //             + "ORDER BY (SUM(pet_days), year, month) DESC "
    //             + "LIMIT 1; "
    //             + "SELECT to_char(to_timestamp (month::TEXT, 'MM'), 'Mon') AS smonth, year AS syear, SUM(salary) AS salary "
    //             + "FROM ct_report "
    //             + "WHERE (year = EXTRACT(year FROM now()) AND month < EXTRACT(month FROM now())) "
    //                 + "OR (year = EXTRACT(year FROM now()) - 1 AND month >= EXTRACT(month FROM now())) "
    //             + "GROUP BY (month, year) "
    //             + "ORDER BY (SUM(salary), year, month) DESC "
    //             + "LIMIT 1; "
    //             + "SELECT to_char(to_timestamp (month::TEXT, 'MM'), 'Mon') AS emonth, year AS eyear, SUM(earnings) AS earnings "
    //             + "FROM ct_report "
    //             + "WHERE (year = EXTRACT(year FROM now()) AND month < EXTRACT(month FROM now())) "
    //                 + "OR (year = EXTRACT(year FROM now()) - 1 AND month >= EXTRACT(month FROM now())) "
    //             + "GROUP BY (month, year) "
    //             + "ORDER BY (SUM(earnings), year, month) DESC "
    //             + "LIMIT 1; "
    //             + "SELECT to_char(to_timestamp (month::TEXT, 'MM'), 'Mon') AS pfmonth, year AS pfyear, (SUM(earnings) - SUM(salary)) AS profit "
    //             + "FROM ct_report "
    //             + "WHERE (year = EXTRACT(year FROM now()) AND month < EXTRACT(month FROM now())) "
    //                 + "OR (year = EXTRACT(year FROM now()) - 1 AND month >= EXTRACT(month FROM now())) "
    //             + "GROUP BY (month, year) "
    //             + "ORDER BY ((SUM(earnings) - SUM(salary)), year, month) DESC "
    //             + "LIMIT 1;";
    const query = "SELECT to_char(to_timestamp (month::TEXT, 'MM'), 'Mon') AS tmonth, year AS tyear, SUM(transactions) AS transactions "
                + "FROM "
                    + "(SELECT f.username, 'Full Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, 3000 AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM full_time f INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON f.username = t.ctuname "
                    + "WHERE t.has_paid AND t.is_completed "
                    + "GROUP BY (f.username, t.emonth, t.eyear) "
                    + "HAVING COUNT(*) <= 60 "
                    + "UNION "
                    + "SELECT f.username, 'Full Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                        + "(3000 + (SELECT SUM(0.8 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                                    + "WHERE t1.ctuname = f.username "
                                        + "AND has_paid AND is_completed "
                                        + "AND EXTRACT(month FROM t1.end_date) = t.emonth "
                                        + "AND EXTRACT(year FROM t1.end_date) = t.eyear "
                                    + "GROUP BY (t1.start_date, t1.end_date) "
                                    + "ORDER BY t1.end_date ASC, t1.start_date ASC "
                                    + "OFFSET 60)) AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM full_time f INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON f.username = t.ctuname "
                    + "WHERE t.has_paid AND t.is_completed "
                    + "GROUP BY (f.username, t.emonth, t.eyear) "
                    + "HAVING COUNT(*) > 60 "
                    + "UNION "
                    + "SELECT p.username, 'Part Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                        + "(SELECT SUM(0.75 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                            + "WHERE t1.ctuname = p.username "
                                + "AND has_paid AND is_completed "
                                + "AND EXTRACT(month FROM t1.end_date) = t.emonth "
                                + "AND EXTRACT(year FROM t1.end_date) = t.eyear) AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM part_time p INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON p.username = t.ctuname "
                    + "WHERE t.has_paid AND t.is_completed "
                    + "GROUP BY (p.username, t.emonth, t.eyear)) AS r "
                + "WHERE (year = EXTRACT(year FROM now()) AND month < EXTRACT(month FROM now())) "
                    + "OR (year = EXTRACT(year FROM now()) - 1 AND month >= EXTRACT(month FROM now())) "
                + "GROUP BY (month, year) "
                + "ORDER BY (SUM(transactions), year, month) DESC "
                + "LIMIT 1; "
                + "SELECT to_char(to_timestamp (month::TEXT, 'MM'), 'Mon') AS pmonth, year AS pyear, SUM(pets) AS pets "
                + "FROM "
                    + "(SELECT f.username, 'Full Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, 3000 AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM full_time f INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON f.username = t.ctuname "
                    + "WHERE t.has_paid AND t.is_completed "
                    + "GROUP BY (f.username, t.emonth, t.eyear) "
                    + "HAVING COUNT(*) <= 60 "
                    + "UNION "
                    + "SELECT f.username, 'Full Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                        + "(3000 + (SELECT SUM(0.8 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                                    + "WHERE t1.ctuname = f.username "
                                        + "AND has_paid AND is_completed "
                                        + "AND EXTRACT(month FROM t1.end_date) = t.emonth "
                                        + "AND EXTRACT(year FROM t1.end_date) = t.eyear "
                                    + "GROUP BY (t1.start_date, t1.end_date) "
                                    + "ORDER BY t1.end_date ASC, t1.start_date ASC "
                                    + "OFFSET 60)) AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM full_time f INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON f.username = t.ctuname "
                    + "WHERE t.has_paid AND t.is_completed "
                    + "GROUP BY (f.username, t.emonth, t.eyear) "
                    + "HAVING COUNT(*) > 60 "
                    + "UNION "
                    + "SELECT p.username, 'Part Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                        + "(SELECT SUM(0.75 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                            + "WHERE t1.ctuname = p.username "
                                + "AND has_paid AND is_completed "
                                + "AND EXTRACT(month FROM t1.end_date) = t.emonth "
                                + "AND EXTRACT(year FROM t1.end_date) = t.eyear) AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM part_time p INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON p.username = t.ctuname "
                    + "WHERE t.has_paid AND t.is_completed "
                    + "GROUP BY (p.username, t.emonth, t.eyear)) AS r "
                + "WHERE (year = EXTRACT(year FROM now()) AND month < EXTRACT(month FROM now())) "
                    + "OR (year = EXTRACT(year FROM now()) - 1 AND month >= EXTRACT(month FROM now())) "
                + "GROUP BY (month, year) "
                + "ORDER BY (SUM(pets), year, month) DESC "
                + "LIMIT 1; "
                + "SELECT to_char(to_timestamp (month::TEXT, 'MM'), 'Mon') AS pdmonth, year AS pdyear, SUM(pet_days) AS pet_days "
                + "FROM "
                    + "(SELECT f.username, 'Full Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, 3000 AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM full_time f INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON f.username = t.ctuname "
                    + "WHERE t.has_paid AND t.is_completed "
                    + "GROUP BY (f.username, t.emonth, t.eyear) "
                    + "HAVING COUNT(*) <= 60 "
                    + "UNION "
                    + "SELECT f.username, 'Full Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                        + "(3000 + (SELECT SUM(0.8 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                                    + "WHERE t1.ctuname = f.username "
                                        + "AND has_paid AND is_completed "
                                        + "AND EXTRACT(month FROM t1.end_date) = t.emonth "
                                        + "AND EXTRACT(year FROM t1.end_date) = t.eyear "
                                    + "GROUP BY (t1.start_date, t1.end_date) "
                                    + "ORDER BY t1.end_date ASC, t1.start_date ASC "
                                    + "OFFSET 60)) AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM full_time f INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON f.username = t.ctuname "
                    + "WHERE t.has_paid AND t.is_completed "
                    + "GROUP BY (f.username, t.emonth, t.eyear) "
                    + "HAVING COUNT(*) > 60 "
                    + "UNION "
                    + "SELECT p.username, 'Part Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                        + "(SELECT SUM(0.75 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                            + "WHERE t1.ctuname = p.username "
                                + "AND has_paid AND is_completed "
                                + "AND EXTRACT(month FROM t1.end_date) = t.emonth "
                                + "AND EXTRACT(year FROM t1.end_date) = t.eyear) AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM part_time p INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON p.username = t.ctuname "
                    + "WHERE t.has_paid AND t.is_completed "
                    + "GROUP BY (p.username, t.emonth, t.eyear)) AS r "
                + "WHERE (year = EXTRACT(year FROM now()) AND month < EXTRACT(month FROM now())) "
                    + "OR (year = EXTRACT(year FROM now()) - 1 AND month >= EXTRACT(month FROM now())) "
                + "GROUP BY (month, year) "
                + "ORDER BY (SUM(pet_days), year, month) DESC "
                + "LIMIT 1; "
                + "SELECT to_char(to_timestamp (month::TEXT, 'MM'), 'Mon') AS smonth, year AS syear, CAST(SUM(salary) AS DECIMAL(100,2)) AS salary "
                + "FROM "
                    + "(SELECT f.username, 'Full Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, 3000 AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM full_time f INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON f.username = t.ctuname "
                    + "WHERE t.has_paid AND t.is_completed "
                    + "GROUP BY (f.username, t.emonth, t.eyear) "
                    + "HAVING COUNT(*) <= 60 "
                    + "UNION "
                    + "SELECT f.username, 'Full Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                        + "(3000 + (SELECT SUM(0.8 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                                    + "WHERE t1.ctuname = f.username "
                                        + "AND has_paid AND is_completed "
                                        + "AND EXTRACT(month FROM t1.end_date) = t.emonth "
                                        + "AND EXTRACT(year FROM t1.end_date) = t.eyear "
                                    + "GROUP BY (t1.start_date, t1.end_date) "
                                    + "ORDER BY t1.end_date ASC, t1.start_date ASC "
                                    + "OFFSET 60)) AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM full_time f INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON f.username = t.ctuname "
                    + "WHERE t.has_paid AND t.is_completed "
                    + "GROUP BY (f.username, t.emonth, t.eyear) "
                    + "HAVING COUNT(*) > 60 "
                    + "UNION "
                    + "SELECT p.username, 'Part Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                        + "(SELECT SUM(0.75 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                            + "WHERE t1.ctuname = p.username "
                                + "AND has_paid AND is_completed "
                                + "AND EXTRACT(month FROM t1.end_date) = t.emonth "
                                + "AND EXTRACT(year FROM t1.end_date) = t.eyear) AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM part_time p INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON p.username = t.ctuname "
                    + "WHERE t.has_paid AND t.is_completed "
                    + "GROUP BY (p.username, t.emonth, t.eyear)) AS r "
                + "WHERE (year = EXTRACT(year FROM now()) AND month < EXTRACT(month FROM now())) "
                    + "OR (year = EXTRACT(year FROM now()) - 1 AND month >= EXTRACT(month FROM now())) "
                + "GROUP BY (month, year) "
                + "ORDER BY (SUM(salary), year, month) DESC "
                + "LIMIT 1; "
                + "SELECT to_char(to_timestamp (month::TEXT, 'MM'), 'Mon') AS emonth, year AS eyear, CAST(SUM(earnings) AS DECIMAL(100,2)) AS earnings "
                + "FROM "
                    + "(SELECT f.username, 'Full Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, 3000 AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM full_time f INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON f.username = t.ctuname "
                    + "WHERE t.has_paid AND t.is_completed "
                    + "GROUP BY (f.username, t.emonth, t.eyear) "
                    + "HAVING COUNT(*) <= 60 "
                    + "UNION "
                    + "SELECT f.username, 'Full Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                        + "(3000 + (SELECT SUM(0.8 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                                    + "WHERE t1.ctuname = f.username "
                                        + "AND has_paid AND is_completed "
                                        + "AND EXTRACT(month FROM t1.end_date) = t.emonth "
                                        + "AND EXTRACT(year FROM t1.end_date) = t.eyear "
                                    + "GROUP BY (t1.start_date, t1.end_date) "
                                    + "ORDER BY t1.end_date ASC, t1.start_date ASC "
                                    + "OFFSET 60)) AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM full_time f INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON f.username = t.ctuname "
                    + "WHERE t.has_paid AND t.is_completed "
                    + "GROUP BY (f.username, t.emonth, t.eyear) "
                    + "HAVING COUNT(*) > 60 "
                    + "UNION "
                    + "SELECT p.username, 'Part Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                        + "(SELECT SUM(0.75 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                            + "WHERE t1.ctuname = p.username "
                                + "AND has_paid AND is_completed "
                                + "AND EXTRACT(month FROM t1.end_date) = t.emonth "
                                + "AND EXTRACT(year FROM t1.end_date) = t.eyear) AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM part_time p INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON p.username = t.ctuname "
                    + "WHERE t.has_paid AND t.is_completed "
                    + "GROUP BY (p.username, t.emonth, t.eyear)) AS r "
                + "WHERE (year = EXTRACT(year FROM now()) AND month < EXTRACT(month FROM now())) "
                    + "OR (year = EXTRACT(year FROM now()) - 1 AND month >= EXTRACT(month FROM now())) "
                + "GROUP BY (month, year) "
                + "ORDER BY (SUM(earnings), year, month) DESC "
                + "LIMIT 1; "
                + "SELECT to_char(to_timestamp (month::TEXT, 'MM'), 'Mon') AS pfmonth, year AS pfyear, CAST((SUM(earnings) - SUM(salary)) AS DECIMAL(100,2)) AS profit "
                + "FROM "
                    + "(SELECT f.username, 'Full Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, 3000 AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM full_time f INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON f.username = t.ctuname "
                    + "WHERE t.has_paid AND t.is_completed "
                    + "GROUP BY (f.username, t.emonth, t.eyear) "
                    + "HAVING COUNT(*) <= 60 "
                    + "UNION "
                    + "SELECT f.username, 'Full Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                        + "(3000 + (SELECT SUM(0.8 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                                    + "WHERE t1.ctuname = f.username "
                                        + "AND has_paid AND is_completed "
                                        + "AND EXTRACT(month FROM t1.end_date) = t.emonth "
                                        + "AND EXTRACT(year FROM t1.end_date) = t.eyear "
                                    + "GROUP BY (t1.start_date, t1.end_date) "
                                    + "ORDER BY t1.end_date ASC, t1.start_date ASC "
                                    + "OFFSET 60)) AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM full_time f INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON f.username = t.ctuname "
                    + "WHERE t.has_paid AND t.is_completed "
                    + "GROUP BY (f.username, t.emonth, t.eyear) "
                    + "HAVING COUNT(*) > 60 "
                    + "UNION "
                    + "SELECT p.username, 'Part Time' AS job_type, COUNT(*) AS transactions, COUNT(DISTINCT t.name) AS pets, "
                        + "SUM(t.end_date - t.start_date + 1) AS pet_days, "
                        + "(SELECT SUM(0.75 * daily_price * (end_date - start_date + 1)) FROM take_care t1 "
                            + "WHERE t1.ctuname = p.username "
                                + "AND has_paid AND is_completed "
                                + "AND EXTRACT(month FROM t1.end_date) = t.emonth "
                                + "AND EXTRACT(year FROM t1.end_date) = t.eyear) AS salary, "
                        + "SUM(t.daily_price * (t.end_date - t.start_date + 1)) AS earnings, "
                        + "t.emonth AS month, t.eyear AS year "
                    + "FROM part_time p INNER JOIN "
                        + "(SELECT *, EXTRACT(month FROM end_date) as emonth, EXTRACT(year FROM end_date) AS eyear FROM take_care) AS t "
                        + "ON p.username = t.ctuname "
                    + "WHERE t.has_paid AND t.is_completed "
                    + "GROUP BY (p.username, t.emonth, t.eyear)) AS r "
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
    const query = `INSERT INTO users VALUES ('${requestBody.username}', '${requestBody.password}', '${requestBody.name}', ` +
                `${requestBody.phone}, '${requestBody.area}'); ` +
                `INSERT INTO pcs_admin VALUES ('${requestBody.username}', '${requestBody.position}'); `;
    console.log("Query: " + query);
    dbController.queryGet(query, (result) => {
        if(result.status == 200) {
            callback(result.body.rows, "Success!");
        } else {
            console.log("Failed.");
            console.log("Status code: " + result.status);
            callback([], result.err.message);
        }
    });
}

exports.addCaretaker = function(requestBody, callback) {
    const user = userController.getUser().getUsername();
    if (requestBody.existing) {
        var query3 = `SELECT 1 FROM users WHERE username = '${requestBody.username}';`;
        dbController.queryGet(query3, (result) => {
            if (result.body.rows.length != 0) { // user exists
                var query2 = `INSERT INTO care_taker VALUES ('${requestBody.username}');`;
                if (requestBody.type == 'fulltime') {
                    query2 += `INSERT INTO full_time VALUES ('${requestBody.username}');`;
                } else {
                    query2 += `INSERT INTO part_time VALUES ('${requestBody.username}');`;
                }
                dbController.queryGet(query2, (result2) => {
                    console.log("Query2: " + query2);
                    if(result2.status == 200) {
                        var query4 = ''
                        if (Array.isArray(requestBody.ptype)) {
                            for (var i = 0; i < requestBody.ptype.length; i++) {
                                query4 += `INSERT INTO can_care VALUES('${requestBody.username}', '${requestBody.ptype[i]}', NULL);`
                            }
                        } else {
                            query4 = `INSERT INTO can_care VALUES('${requestBody.username}', '${requestBody.ptype}', NULL);`
                        }
                        console.log("Query4: " + query4);

                        dbController.queryGet(query4, (result3) => {
                            console.log("Query4: " + query4);
                            if(result3.status == 200) {
                                callback("Success!");
                            } else {
                                console.log("Failed.");
                                console.log("Status code: " + result3.status);
                                callback(result3.err.message);
                            }
                        });
                    } else {
                        console.log("Failed.");
                        console.log("Status code: " + result2.status);
                        callback(result2.err.message);
                    }
                });
            } else {
                callback("This user does not exists!");
            }
        });
    } else {
        var query = `INSERT INTO users VALUES ('${requestBody.username}', '${requestBody.password}', '${requestBody.name}', ` +
                    `${requestBody.phone}, '${requestBody.area}'); `
        dbController.queryGet(query, (result) => {
            if (result.err) { // user exists
                callback(result.err.message);
            } else {
                var query2 = `INSERT INTO care_taker VALUES ('${requestBody.username}');`;
                if (requestBody.type == 'fulltime') {
                    query2 += `INSERT INTO full_time VALUES ('${requestBody.username}');`;
                } else {
                    query2 += `INSERT INTO part_time VALUES ('${requestBody.username}');`;
                }
                dbController.queryGet(query2, (result2) => {
                    console.log("Query: " + query);
                    console.log("Query2: " + query2);
                    if(result2.status == 200) {
                        var query4 = ''
                        if (Array.isArray(requestBody.ptype)) {
                            for (var i = 0; i < requestBody.ptype.length; i++) {
                                query4 += `INSERT INTO can_care VALUES('${requestBody.username}', '${requestBody.ptype[i]}', NULL);`
                            }
                        } else {
                            query4 = `INSERT INTO can_care VALUES('${requestBody.username}', '${requestBody.ptype}', NULL);`
                        }

                        dbController.queryGet(query4, (result3) => {
                            console.log("Query: " + query);
                            console.log("Query4: " + query4);
                            if(result3.status == 200) {
                                callback("Success!");
                            } else {
                                console.log("Failed.");
                                console.log("Status code: " + result3.status);
                                callback(result3.err.message);
                            }
                        });
                    } else {
                        console.log("Failed.");
                        console.log("Status code: " + result2.status);
                        callback(result2.err.message);
                    }
                });
            }
        });
    }
}
