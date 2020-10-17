class User {

    constructor(userData) {
        this.username = userData.username;
        this.name = userData.name;
        this.phone_no = userData.phone,
        this.area = userData.area,
        this.is_owner = userData.isOwner;
        this.is_caretaker = userData.isCaretaker;
        this.is_admin = userData.isAdmin;
    }

    getUsername() {
        return this.username;
    }

    getName() {
        return this.name;
    }

    isOwner() {
        return this.is_owner;
    }

    isCaretaker() {
        return this.is_caretaker;
    }

    isAdmin() {
        return this.is_admin;
    }
}

module.exports = User;