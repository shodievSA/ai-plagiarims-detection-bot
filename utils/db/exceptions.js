

class UserDoesNotExist extends Error {
    constructor(message = 'User does not exist.') {
        super(message);
        this.name = 'UserDoesNotExist';
        this.statusCode = 404;
    }
}

module.exports = {UserDoesNotExist}