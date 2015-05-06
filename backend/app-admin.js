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
  .use( require('./middleware/breadcumbs')( app ) )
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

app.get( '/', Layout({
  "name": "Panel de administración de expomar.com",
  "desc": "Páxina principal da interface de administración",
  "layout": admin.concat('admin/0-portada.swig.html')
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
;

var NotFound = Layout({
  "name": "Page Not Found",
  "desc": "Page Not Found",
  "layout": admin.concat( "404.swig.html" ),
  "styles": "404.less"
});

var eventos = {
  "feira": require('../data/anosFeira')
};
var event_ids = Object.keys(eventos);
app.param( 'event_id', function( req, res, next, id ){
  if( !~event_ids.indexOf(id) ){
    res.status(404);
    return NotFound( req, res, next );
  }
  res.locals.event_id = id;
  res.locals.event_anos = eventos[id];
  next();
});
app.param( 'event_ano', function( req, res, next, ano ){
  if( !~res.locals.event_anos.indexOf(ano) ){
    res.status(404);
    return NotFound( req, res, next );
  }
  res.locals.event_ano = ano;
  next();
});
app.get( '/:event_id', Layout({
  "name": "Seleccion ano evento",
  "desc": "Descricion breve seleccionar ano",
  "layout": admin.concat('admin/1-evento.swig.html')
}) );
app.get( '/:event_id/:event_ano', Layout({
  "name": "Resumo evento",
  "desc": "Descricion breve portada evento",
  "layout": admin.concat('admin/1-evento.swig.html')
}) );

