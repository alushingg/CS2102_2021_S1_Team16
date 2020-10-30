class User {

    constructor(userData) {
        this.username = userData.username;
        this.name = userData.name;
        this.phone_no = userData.phone,
        this.area = userData.area,
        this.is_owner = userData.isOwner;
        this.is_caretaker = userData.isCaretaker;
        this.is_admin = userData.isAdmin;
        this.is_poct = userData.isPOCT;
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

    isPOCT() {
        return this.is_poct; //0 = not POCT, 1 = currently PO, 2 = currently CT
    }

    changeUser() {
        if (this.is_poct == 2) {
            this.is_caretaker = false;
            this.is_owner = true;
            this.is_poct = 1;
        } else if (this.is_poct == 1) {
            this.is_caretaker = true;
            this.is_owner = false;
            this.is_poct = 2;
        }
    }
}

module.exports = User;