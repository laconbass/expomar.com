var nodemailer = require('nodemailer');
var xoauth2 = require('xoauth2');
var conf = require('../conf/mailer.js');

var generator = xoauth2.createXOAuth2Generator({
  user: conf.guser,
  clientId: conf.client_id,
  clientSecret: conf.client_secret,
  refreshToken: conf.refresh_token
});
generator.on('token', function( token ){
  console.log('MAIL SERVICE: Refreshed access token for %s', token.user);
});

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { xoauth2: generator }
});

exports.send = function( opts, callback ){
  // TODO validate options through schema
  if( ! opts.to ){
    return callback( new Error('destination address not provided') );
  }
  if( ! opts.subject ){
    return callback( new Error('message subject not provided') );
  }
  var options = {
    from: conf.name + ' <' + conf.guser +'>',
    to: opts.to,
    subject: opts.subject,
    text: opts.message || '(mensaxe vacío)'
  };
  console.log('MAIL SERVICE: going to send email to %s', options.to);
  transporter.sendMail( options, function( err, info ){
    if( err ){
      console.error( err );
      console.log('MAIL SERVICE: error sending mail, details on stderr');
      return callback( err );
    }
    console.log( 'MAIL SERVICE: message accepted by %s', info.accepted );
    callback( null, info );
  });
};
