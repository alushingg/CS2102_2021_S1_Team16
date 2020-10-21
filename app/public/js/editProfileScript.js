function checkPO(event) {
	// Get Values
	var phone = document.getElementById('phone').value;
	var creditcard = document.getElementById('creditcard').value;

	// Simple Check
	if (phone && !isValidPhone(phone)) {
		alert("Invalid phone number. Phone number should be between 7 and 15 digits.");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if (creditcard && !isValidCreditCard(creditcard)) {
		alert("Invalid credit card number. Credit card number should be 16 digits.");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
}

function checkAdmin(event) {
	// Get Values
	var phone = document.getElementById('phone').value;

	// Simple Check
	if (phone && !isValidPhone(phone)) {
		alert("Invalid phone number. Phone number should be between 7 and 15 digits.");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
}

function isValidPhone(phone) {
    if (!/^\d{7,15}$/.test(phone))
        return false;
    return true;
};

function isValidCreditCard(creditcard) {
    if (!/^\d{16}$/.test(creditcard))
        return false;
    return true;
};
