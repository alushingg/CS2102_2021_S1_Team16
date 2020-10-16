function check(event) {
	// Get Values
	var sdate = document.getElementById('start_date').value;
	var edate = document.getElementById('end_date').value;

	// Simple Check
	if (!isValidDate(sdate)) {
		alert("Invalid start date");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if (!isValidDate(edate)) {
		alert("Invalid end date");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if (!isStartBeforeEnd(sdate, edate)) {
		alert("End date is before start date");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
}

function isValidDate(dateString) {
    // First check for the pattern
    if(!/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("-");
    var day = parseInt(parts[2], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[0], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
};

function isStartBeforeEnd(sdate, edate) {
    var sparts = sdate.split("-");
    var sday = parseInt(sparts[2], 10);
    var smonth = parseInt(sparts[1], 10);
    var syear = parseInt(sparts[0], 10);

    var eparts = edate.split("-");
    var eday = parseInt(eparts[2], 10);
    var emonth = parseInt(eparts[1], 10);
    var eyear = parseInt(eparts[0], 10);

    if (eyear < syear || emonth < smonth || eday < sday) {
    	return false;
    }
    
    return true;
};
