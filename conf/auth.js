var production = require('./abc').production

if( production && !process.env.EXPOMAR_SECRET ){
  throw new Error('you forget to provide a EXPOMAR_SECRET env var');
}
exports.secret = process.env.EXPOMAR_SECRET || 'hola que tal';

