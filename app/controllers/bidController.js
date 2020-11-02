const dbController = require('./dbController');
const userController = require('./userController');

exports.getPets = function(req, type, sdate, edate, callback) {
    const user = userController.getUser().getUsername();
    const { ctuname } = req.params;
    const query = "SELECT name FROM own_pet_belong WHERE username = '" + user + "' AND type = '" + type + "'; "
                + "SELECT CAST(COALESCE(price, base_price) AS DECIMAL(100,2)) AS price, CAST((DATE('" + edate + "') - DATE('" + sdate + "') + 1) * COALESCE(price, base_price) AS DECIMAL(100,2)) AS total_price "
                + "FROM can_care cc NATURAL JOIN category c "
                + "WHERE username='" + ctuname + "' AND cc.type='" + type + "';";
  	dbController.queryGet(query, (result) => {
        if(result.status == 200) {
            callback(result.body[0].rows, result.body[1].rows);
        } else {
            console.log("Failed.");
            console.log("Status code: " + result.status);
            callback([]);
        }
    });
}

exports.addBid = function(req, type, sdate, edate, callback) {
// INSERT INTO period (start_date, end_date) VALUES ($start_date, $end_date);
// INSERT INTO take_care (username, name, start_date, end_date, ctuname, has_paid, daily_price, is_completed,
// review, rating, transfer_method, payment_mode)
// VALUES ($username, $name, $start_date, $end_date, $ctuname, FALSE, $daily_price, FALSE,
// NULL, NULL, $transfer_method, $payment_mode);
// SELECT type, COALESCE(price, base_price) as price
// FROM can_care NATURAL JOIN category
// WHERE username = $username;
    const user = userController.getUser().getUsername();
    const { ctuname } = req.params;
    const pricequery = "SELECT COALESCE(price, base_price) AS price FROM can_care cc NATURAL JOIN category c " +
                    "WHERE username='" + ctuname + "' AND cc.type='" + type + "';";
    console.log(pricequery);
    dbController.queryGet(pricequery, (result) => {
        if (result.status == 200) {
            const period = "INSERT INTO period VALUES ('" + sdate + "', '" + edate + "');";
            const query = period + "INSERT INTO take_care VALUES ('" + user + "', '" + req.body.petname + "', '" + sdate +
                        "', '" + edate + "', '" + ctuname + "', FALSE, '" + result.body.rows[0].price +
                        "', FALSE, NULL, NULL, '" + req.body.transfer + "', '" + req.body.payment + "');";
            console.log(query);
            dbController.queryGet(query, (result) => {
                if (result.status == 200) {
                    callback("");
                } else {
                    console.log("Failed.");
                    console.log("Status code: " + result.status);
                    callback(result.err.message);
                }
            });
        } else {
            console.log("Failed.");
            console.log("Status code: " + result.status);
            callback("");
        }
    });



}