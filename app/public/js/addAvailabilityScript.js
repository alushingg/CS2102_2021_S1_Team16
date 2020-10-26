function check(event) {
	// Get Values
	var day = document.getElementById('day').value;
	var month = document.getElementById('month').value;
	var year = document.getElementById('year').value;

	// Simple Check
		if (!isValidDay(day)) {
			alert("Invalid");
			event.preventDefault();
			event.stopPropagation();
			return false;
		}
    if (!isValidMonth(month)) {
        alert("Invalid");
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
    if (!isValidYear(year)) {
        alert("Invalid");
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
    if (!dateHasPassed(day, month, year)) {
        alert("Date has passed");
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
}

function isValidDay(day) {
    if (!/^\d{1,2}$/.test(day))
        return false;
    if (day < 0 || day >=31 )
        return false;
    return true;
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

function dateHasPassed(day, month, year) {
    var currdate = new Date();
    if (year < currdate.getFullYear())
        return false;
    if (year = currdate.getFullYear() && month <= currdate.getMonth() + 1)
        return false;
		if (year = currdate.getFullYear() && month <= currdate.getMonth() + 1 && day <= currdate.getDay())
				return false;
    return true;
}
