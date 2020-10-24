function check(event) {
	// Get Values
	var month = document.getElementById('month').value;
	var year = document.getElementById('year').value;

	// Simple Check
    if (!isValidMonth(month)) {
        alert("Invalid month");
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
    if (!isValidYear(year)) {
        alert("Invalid year");
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
    if (!monthHasPassed(month, year)) {
        alert("Month has not passed");
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
}

function isValidMonth(month) {
    if (!/^\d{1,2}$/.test(month))
        return false;
    if (month < 0 || month > 12)
        return false;
    return true;
}

function isValidYear(year) {
    if (!/^\d{4}$/.test(year))
        return false;
    if (year < 1000 || year > 3000)
        return false;
    return true;
}

function monthHasPassed(month, year) {
    var currdate = new Date();
    if (year > currdate.getFullYear())
        return false;
    if (year == currdate.getFullYear() && month >= currdate.getMonth() + 1)
        return false;
    return true;
}
