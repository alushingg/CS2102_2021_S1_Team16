function check(event) {
	// Get Values
	var sdate = processDate(document.getElementById('start_date').value);
    var edate = processDate(document.getElementById('end_date').value);

	// Simple Check
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