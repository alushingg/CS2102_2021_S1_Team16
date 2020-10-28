function check(event) {
	// Get Values
	var day = document.getElementById('day').value;
	var month = document.getElementById('month').value;
	var year = document.getElementById('year').value;

	// Simple Check
	if (!isValidDate(day, month, year)) {
		alert("Invalid date");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
    if (dateHasPassed(day, month, year)) {
        alert("Date has passed");
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
}

function isValidDate(day, month, year) {
    if (!/^\d{1,2}$/.test(day))
        return false;
    if (!/^\d{1,2}$/.test(month))
        return false;
    if (!/^\d{4}$/.test(year))
        return false;

    if (year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
}

function dateHasPassed(day, month, year) {
    var currdate = new Date();
    if (year < currdate.getFullYear())
        return true;
    if (year == currdate.getFullYear() && month < currdate.getMonth() + 1)
        return true;
	if (year == currdate.getFullYear() && month == currdate.getMonth() + 1 && day < currdate.getDay())
		return true;
    return false;
}
