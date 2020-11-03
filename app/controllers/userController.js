const User = require('../model/user');

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

exports.changeUser = function(user) {
    if (user.isPOCT === 2) {
        return this.newUser(user, true, false, false, 1);
    } else if (user.isPOCT === 1) {
        return this.newUser(user, false, true, false, 2);
    }
}