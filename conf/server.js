
var production = exports.production = process.env.NODE_ENV === 'production';

exports.mode = mode = 'http';
exports.domain = production? 'expomar.com' : 'expomar.loc';
exports.port = production?  61337 : 3000;

if( production && !process.env.EXPOMAR_SECRET ){
  throw new Error('you forget to provide a EXPOMAR_SECRET env var');
}
exports.secret = process.env.EXPOMAR_SECRET || 'hola que tal';
