var express = require( 'express' )
  , app = express.Router()
  , auth = require( './app-auth.js' )()
 // , f = require('util').format
;

module.exports = app;

//
// Middleware
//

function menuTop( menu ){
  return function( req, res, next ){ res.locals.menuTop = menu; next(); };
}

app
  .use( require('./middleware/messages')() )
  .use( require('./middleware/urlConstructor')( require('./utils').url ) )
  .use( require('./middleware/i18n')( 'gl', [] ) )
  .use( auth )
;


//
// Routes
//

var Layout = require( './middleware/Layout' );
var admin = [ 'theme2.swig.html' ];


app.all( '/login', Layout({
  "name": "Identifíquese",
  "desc": "Páxina de acceso á interface de administración",
  "layout": admin.concat('login.swig.html'),
  "styles": "login.less"
}) );

app.all( '*', menuTop({
  "/eval": { text: 'eval' }
}) );

app.get( '/', Layout({
  "name": "Panel de administración de expomar.com",
  "desc": "Páxina principal da interface de administración",
  "layout": admin
}) );


app.route( '/eval' )
  .get( Layout({
    "name": "Utilidade de evaluación de código",
    "desc": "Inserir código para ser evaluado no contexto do servidor",
    "layout": admin.concat('admin/eval.swig.html')
  }) )
  .post(function( req, res, next ){
    res.sendStatus(404);
  })

