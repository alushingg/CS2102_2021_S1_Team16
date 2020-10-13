class User {

    constructor(userData) {
        this.username = userData.username;
        this.name = userData.name;
        this.phone_no = userData.phone,
        this.area = userData.area,
        this.isOwner = userData.isOwner;
        this.isCaretaker = userData.isCaretaker;
        this.isAdmin = userData.isAdmin;
    }

    getUsername() {
        return this.username;
    }

    getName() {
        return this.name;
    }

    isOwner() {
        return this.isOwner;
    }

    isCaretaker() {
        return this.isCaretaker;
    }

    isAdmin() {
        return this.isAdmin;
    }
}

module.exports = User;