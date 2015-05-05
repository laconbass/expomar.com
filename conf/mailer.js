
exports.name = 'Web Fundación Expomar';

try {
  var google = require('./google-webapp.json');
} catch( err ){
  throw new Error('you forget uploadig conf/google-webapp.json');
}
// user & keys for google authentication service
exports.guser = 'expomar.web@gmail.com';
exports.client_id = google.web.client_id;
exports.client_secret = google.web.client_secret;
exports.refresh_token = google.refresh_token;

