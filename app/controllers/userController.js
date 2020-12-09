const User = require('../model/user');
const { use } = require('../router');
const dbController = require('./dbController');

exports.newUser = function(userData, isOwner, isCaretaker, isAdmin, isPOCT) {
    return new User({
        'username': userData.username,
        'name': userData.name,
        'phone': userData.phone_number,
        'area': userData.area,
        'isOwner': isOwner,
        'isCaretaker': isCaretaker,
        'isAdmin': isAdmin,
        'isPOCT' : isPOCT
    });
}

exports.getOwnedPetTypes = function(userData, callback) {
    const query = "SELECT DISTINCT type FROM own_pet_belong WHERE username = '" + userData.username + "' ORDER BY type;"
    console.log("Getting pet types:");
    console.log(query);

    dbController.queryGet(query, (result) => {
        if (result.status === 200) {
            callback(result.body.rows);
        } else {
            console.log("getPetTypes: Query Failed. Error code " + result.status);
            callback(null);
        }
    });
}

exports.getCreditCard = function(username, callback) {
    const query = "SELECT credit_card FROM pet_owner WHERE username = '" + username + "';"
    console.log("Getting credit card details:");
    console.log(query);

    dbController.queryGet(query, (result) => {
        if (result.status === 200) {
            callback(result.body.rows[0].credit_card);
        } else {
            console.log("getCreditCard: Query Failed. Error code " + result.status);
            callback([]);
        }
    });
}

exports.changeUser = function(user) {
    if (user.isPOCT === 2) {
        return this.newUser(user, true, false, false, 1);
    } else if (user.isPOCT === 1) {
        return this.newUser(user, false, true, false, 2);
    }
}