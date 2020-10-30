function check(event) {
	// Get Values
	var sdate = processDate(document.getElementById('start_date').value);
    var edate = processDate(document.getElementById('end_date').value);

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
    if (hasStartDatePassed(sdate)) {
        alert("Start date has passed");
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
}

function isValidDate(dateString) {
    // First check for the pattern
    if (!/^\d{4}$/.test(dateString.year))
        return false;
    if (!/^\d{1,2}$/.test(dateString.month))
        return false;
    if (!/^\d{1,2}$/.test(dateString.day))
        return false;

    var day = dateString.day;
    var month = dateString.month;
    var year = dateString.year;

    // Check the ranges of month and year
    if (year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
};

function isStartBeforeEnd(start, end) {

    if (end.year < start.year)
        return false;

    if (end.year === start.year && end.month < start.month)
        return false;

    if (end.year === start.year && end.month === start.month && end.day < start.day)
        return false;

    return true;
};

function hasStartDatePassed(date) {
    var today = new Date();
    var start = new Date(date.year, date.month, date.day);

    if (start.getFullYear() < today.getFullYear())
        return true;

    if (start.getFullYear() === today.getFullYear() && start.getMonth() - 1 < today.getMonth())
        return true;

    if (start.getFullYear() === today.getFullYear() && start.getMonth() - 1 === today.getMonth() && start.getDate() < today.getDate())
        return true;

    return false;
};

function processDate(dateString) {
    var parts = dateString.split("-");
    var day = parseInt(parts[2], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[0], 10);

    return {
        'day': day,
        'month': month,
        'year': year,
    }
}
