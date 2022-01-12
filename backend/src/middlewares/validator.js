const validator = require('validator');

module.exports.whitelistNameValidator = (input) => {
    const whitelist = validator.whitelist(input, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l' , 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L' , 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' ']);
    if (input != whitelist) {
        throw new Error ('Input did not meet requirements!');
    }
    else {
        return input;
    }
};

module.exports.miscNameValidator = (input) => {
    const whitelist = validator.whitelist(input, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l' , 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L' , 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' ',
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', ',', '.', ';', ':']);
    if (input != whitelist) {
        throw new Error ('Input did not meet requirements!');
    }
    else {
        return input;
    }
};

module.exports.usernameValidator = (input) => {
    const whitelist = validator.whitelist(input, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l' , 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L' , 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' ',
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '_']);
    if (input != whitelist) {
        throw new Error ('Input did not meet requirements!');
    }
    else {
        return input;
    }
};

module.exports.passwordValidator = (input) => {
    const whitelist = validator.whitelist(input, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l' , 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L' , 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' ',
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '!', '@', '#', '$', '%', '^', '&', '*']);
    if (input != whitelist) {
        throw new Error ('Input did not meet requirements!');
    }
    else {
        return input;
    }
};

module.exports.addressValidator = (input) => {
    const whitelist = validator.whitelist(input, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l' , 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L' , 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' ',
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '\'', '#']);
    if (input != whitelist) {
        throw new Error ('Input did not meet requirements!');
    }
    else {
        return input;
    }
};

module.exports.customEmailValidator = (input) => {
    input = validator.blacklist(input, ['/', '<', '>', '\"', ';', ':']);
    return input;
};

module.exports.validateEmail = (input) => {
    if (!validator.isEmail(input)) {
        input = this.customEmailValidator(input);
    }
    return input;
};
