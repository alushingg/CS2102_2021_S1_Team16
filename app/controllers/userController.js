const User = require('../model/user');
const { use } = require('../router');
var user = undefined;

exports.trackUser = function(userData, isOwner, isCaretaker, isAdmin, isPOCT) {
    user = new User({
        'username': userData.username,
        'name': userData.name,
        'phone': userData.phone_number,
        'area': userData.area,
        'isOwner': isOwner,
        'isCaretaker': isCaretaker,
        'isAdmin': isAdmin,
        'isPOCT' : isPOCT
    });
    this.user = user;
    console.log(user);
};

exports.logout = function() {
    this.user = undefined;
}

exports.getUser = function() {
    return this.user;
};

exports.getUsername = function() {
    if(this.user === undefined) {
        return null;
    } else {
        return this.user.username;
    }
};