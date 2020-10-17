const User = require('../model/user');
const { use } = require('../router');
var user = undefined;

exports.trackUser = function(userData, isOwner, isCaretaker, isAdmin) {
    user = new User({
        'username': userData.username,
        'name': userData.name,
        'phone': userData.phone_number,
        'area': userData.area,
        'isOwner': isOwner,
        'isCaretaker': isCaretaker,
        'isAdmin': isAdmin
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