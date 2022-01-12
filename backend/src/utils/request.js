// i am not sure if this is a bulletproof solution
// also it is possible to do "?x=1&x=true&x=whateverElse" and get an array
// ignoring arrays
module.exports.parseBoolean = (value) => /^(1|true)$/i.test(`${value}`);
