const User = require('../model/user');
const { use } = require('../router');
var user = undefined;

exports.trackUser = function(userData) {
    user = new User({
        'username': userData.username,
        'name': userData.name,
        'phone': userData.phone_number,
        'area': userData.area,
        'isOwner': true,
        'isCaretaker': false,
        'isAdmin': false
    });
    console.log(user);
};

exports.logout = function() {
    this.user = undefined;
}

exports.getUser = function() {
    return this.user;
};