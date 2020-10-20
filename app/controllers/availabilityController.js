const dbController = require('./dbController');

exports.findCaretaker = function(type, sdate, edate, callback) {
  	const query = "SELECT u.username, u.name, u.phone_number, u.area, ROUND(ratings.rating, 2) as rating, COALESCE(c.price,cat.base_price) as price, 'Full Time' as job_type " 
				+ "FROM full_time f NATURAL JOIN users u NATURAL JOIN can_care c NATURAL JOIN category cat " 
				+ "LEFT JOIN (SELECT t.ctuname AS username, AVG(t.rating) AS rating FROM take_care t GROUP BY t.ctuname) AS ratings ON f.username = ratings.username "
				+ "WHERE c.type = '" + type + "' "
				+ "AND NOT EXISTS (SELECT 1 "
								+ "FROM (SELECT date FROM apply_leave WHERE username = u.username) as d "
								+ "WHERE d.date >= DATE('" + sdate + "') AND d.date <= DATE('" + edate + "')) AND DATE('" + sdate + "') <= DATE('" + edate + "') "
				+ "AND (SELECT COUNT(*) FROM take_care t1 "
    				+ "WHERE t1.ctuname = u.username "
        				+ "AND ((t1.start_date >= DATE('" + sdate + "') AND t1.start_date <= DATE('" + edate + "')) "
         					+ "OR (t1.end_date >= DATE('" + sdate + "') AND t1.end_date <= DATE('" + edate + "')))) < 5 "
				+ "UNION "
				+ "SELECT u.username, u.name, u.phone_number, u.area, ROUND(ratings.rating, 2) as rating, COALESCE(c.price, cat.base_price) as price, 'Part Time' as job_type "
				+ "FROM part_time p NATURAL JOIN users u NATURAL JOIN can_care c NATURAL JOIN category cat "
				+ "LEFT JOIN (SELECT t.ctuname AS username, AVG(t.rating) AS rating FROM take_care t GROUP BY t.ctuname) AS ratings ON p.username = ratings.username "
				+ "WHERE c.type = '" + type + "' "
				+ "AND (SELECT COUNT(*) "
					+ "FROM specify_availability s "
					+ "WHERE s.username = p.username AND (date >= DATE('" + sdate + "') AND date <= DATE('" + edate + "'))) "
				+ "= (DATE('" + edate + "') - DATE('" + sdate + "')) + 1 "
				+ "AND (((ratings.rating IS NULL or ratings.rating < 4) "
            		+ "AND (SELECT COUNT(*) FROM take_care t1 "
    					+ "WHERE t1.ctuname = u.username "
        					+ "AND ((t1.start_date >= DATE('" + sdate + "') AND t1.start_date <= DATE('" + edate + "')) "
         						+ "OR (t1.end_date >= DATE('" + sdate + "') AND t1.end_date <= DATE('" + edate + "')))) < 2) "
        		+ "OR (ratings.rating >= 4 "
           			+ "AND (SELECT COUNT(*) FROM take_care t1 "
    					+ "WHERE t1.ctuname = u.username "
        					+ "AND ((t1.start_date >= DATE('" + sdate + "') AND t1.start_date <= DATE('" + edate + "')) "
         						+ "OR (t1.end_date >= DATE('" + sdate + "') AND t1.end_date <= DATE('" + edate + "')))) < 5));";
  	dbController.queryGet(query, (result) => {
  		//console.log(query);
        if(result.status == 200) {
            callback(result.body.rows);
        } else {
            console.log("Failed.");
            console.log("Status code: " + result.status);
            callback([]);
        }
    });
};
