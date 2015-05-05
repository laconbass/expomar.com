
var production = require('./abc').production

exports.mode = mode = 'http';
exports.domain = production? 'expomar.com' : 'expomar.lan';
exports.port = production?  61337 : 3000;

