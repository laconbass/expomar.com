var express = require('express')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , session = require('express-session')
  , passport = require('passport')
  , LocalStrategy = require('passport-local')
  , UserManager = require('./model/user/UserManager')
;

passport.use(new LocalStrategy(function(username, password, done) {
  UserManager.authenticate( username, password, function(err, user, info) {
    if( err ){
      return done(err);
    }
    if( user ){
      return done( null, user );
    }
    return done( null, false );
  });
}));

passport.serializeUser(function(user, done) {
  done( null, user.pk );
});

passport.deserializeUser(function(pk, done) {
  UserManager.read( pk, done );
});

// pass a view as function(req, res) that displays the login form
module.exports = auth;
function auth( login ){
  return express.Router()
    .use( bodyParser.json() )
    .use( bodyParser.urlencoded({ extended: true}) )
    .use( cookieParser('hola que tal') )
    .use( session({
      secret: 'hola que tal',
      resave: true,
      saveUninitialized: true
    }) )
    .use( passport.initialize() )
    //.use( passport.session() )
    // ROUTES
    //.get( '/login', function(req, res){ res.end("show login"); } )
    .get( '/login', login )
    .all( '*', passport.authenticate('local', {
      successRedirect: '/', failureRedirect: '/login'
     }) )
  ;
};
