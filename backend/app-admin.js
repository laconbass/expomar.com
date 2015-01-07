var iai = require('iai')
  , project = iai.project
  , express = require( 'express' )
  , app = express.Router()
  , auth = iai.project.require( 'backend/app-auth.js' )
 // , f = require('util').format
;

module.exports = app;

//
// Layout
//

var Layout = project.require( 'backend/middleware/Layout' );

var admin = [ 'admin.swig.html' ];

//
// Middleware
//

app
  .use( auth(Layout({
    "name": "Identifíquese",
    "desc": "Páxina de acceso á interface de administración",
    "layout": admin
  })) )
  .use( require('./middleware/messages')() )
  .use( require('./middleware/urlConstructor')( require('./utils').url ) )
  .use( require('./middleware/i18n')( 'gl', [] ) )
;


//
// Routes
//

app.get( '/', Layout({
  "name": "Panel de administración de expomar.com",
  "desc": "Páxina principal da interface de administración",
  "layout": admin
}) );
