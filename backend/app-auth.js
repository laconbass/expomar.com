var iai = require('iai')
  , express = require( 'express' )
  , passport = require('passport')
  , LocalStrategy = require('passport-local')
  , UserManager = iai.project.require('backend/model/user/UserManager')
;

module.exports = auth;

passport.use(new LocalStrategy(function(username, password, done) {
  console.log( "before" );
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

// pass a view as function(req, res)
module.exports = auth;
function auth( login ){
  return express.Router()
    //.use( express.cookieParser() )
    //.use( express.bodyParser() )
    //.use( express.session({ secret: 'hola que tal' }) )
    .use( passport.initialize() )
    //.use( passport.session() )
    // ROUTES
    .get( '/login', function(req, res){ res.end("show login"); } )
    .all( '*', passport.authenticate('local', {
      successRedirect: '/', failureRedirect: '/login'
    }) )
  ;
};

          passport.authenticate('local', {
            successRedirect: req.session.goingTo || '/profile',
            failureRedirect: '/login',
            failureFlash: true
        })(req, res);

