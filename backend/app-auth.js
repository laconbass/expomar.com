var express = require('express')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , session = require('express-session')
  , passport = require('passport')
  , LocalStrategy = require('passport-local')
  , UserManager = require('./model/user/UserManager')
  , conf = require('../conf/auth')
  , url = require('url')
;

passport.use(new LocalStrategy(function(username, password, done) {
  UserManager.authenticate( username, password, function(err, user) {
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

/**
 * Exports a function that creates an auth layer (express.Router)
 */

module.exports = auth;

function auth( opts ){
  opts = opts || {};
  opts.indexUrl = opts.indexUrl || '/';
  opts.loginUrl = opts.loginUrl || '/login';
  opts.logoutUrl = opts.logoutUrl || '/logout';
  return express.Router()
    .use( bodyParser.json() )
    .use( bodyParser.urlencoded({ extended: true }) )
    .use( cookieParser(conf.secret) )
    .use( session({
      secret: conf.secret,
      resave: true,
      saveUninitialized: true
    }) )
    .use( passport.initialize() )
    .use( passport.session() )
    // ensure every request is authenticated except loginUrl
    .all( '*', function skipIfLoginUrlOrCheckAuth( req, res, next ){
      var URL = url.parse( req.url, true );
      var isLoginUrl = (URL.pathname === opts.loginUrl);
      if( req.isAuthenticated() ){
        res.locals.user = req.user;
        // just to avoid accidentaly printing it on templates
        delete res.locals.user.password;
        if( isLoginUrl ){
          return res.redirect( opts.indexUrl );
        }
        return next();
      }
      // not authenticated
      if( isLoginUrl ){
        if( URL.query && URL.query.next ){
          res.locals.next_url = URL.query.next;
        }
        return next();
      }
      var target = opts.loginUrl;
      if( URL.pathname !== opts.indexUrl ){
        target += '?next=' + encodeURIComponent(req.originalUrl)
      }
      res.redirect( target );
    })
    // intercept POST requests to loginUrl, so user can log in
    .post( opts.loginUrl, function( req, res, next ){
      passport.authenticate('local', function( err, user ){
        if( err ) return next(err);
        if( !user ){
          res.message( 'Os credenciais inseridos non son válidos' );
          return next();
        }
        req.logIn( user, function( err ){
          if( err ) return next(err);
          return res.redirect( req.body.next || opts.indexUrl );
        });
      })(req, res, next);
    })
    // intercept GET requests to logoutUrl, so user can log out
    .get( opts.logoutUrl, function( req, res ){
      req.logout();
      res.redirect( opts.indexUrl );
    })
  ;
};
