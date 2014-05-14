var iai = require('../../iai')
  , project = iai.project
  , public = iai( project.resolve('layouts/public') )
  , express = require( 'express' )
  , app = express.Router()
  , debug = require( 'debug' )( 'expomar.com:public' )
  , f = require('util').format
;

module.exports = app;

//
// Middleware
//

app
  .use( project.require('backend/middleware/messages')() )
  .use( project.require('backend/middleware/urlConstructor')() )
  .use( project.require('backend/middleware/i18n')( 'gl', ['es', 'en'], project.require('backend/translator') ) )
  .use( project.require('backend/middleware/breadcumbs')( app ) )
  //.use( app.router )
;

//
// View Controllers
//

var Controller = project.require( 'backend/middleware/Controller' )
  , Layout = project.require( 'backend/middleware/Layout' )
;

function redirect( meta ){
  meta = meta || {};

  if( !meta.location ){
    throw new Error( 'redirect controller needs a location' );
  }

  function redirect( req, res, next ){
    res.redirect( meta.location );
  }

  return Controller( meta, redirect );
}

var Document = project.require( 'backend/middleware/Document' );

//
// Routes
//

var public = [ "public.swig.html" ];

app.get( '/', Layout({
  "name": "Portada",
  "desc": "Páxina principal",
  "layout": public.concat( "public/portada.swig.html" ),
  "styles": "public/portada.less"
}) );

app
  .get( '/actualidade', Layout({
      "name": "Actualidade",
      "desc": "Novidades sobre o entorno da Fundación Expomar",
      "layout": public.concat( "404-working.swig.html" )
  }) )
  .get( '/axenda', Layout({
      "name": "Axenda",
      "desc": "Calendario de eventos e actividades",
      "layout": public.concat( "404-working.swig.html" )
  }) )
  .get( '/contacto', Layout({
      "name": "Contacto",
      "desc": "Onde estamos e como contactar con nós",
      "layout": public.concat( "404-working.swig.html" )
  }) )
;

var fundacion = public.concat( "public/a-fundacion/a-fundacion.swig.html" );

app.use(
  '/a-fundacion',
  express.Router()
  .get( '/', redirect({
    "name": "A Fundación",
    "desc": "A Fundación Expomar",
    "location": "/a-fundacion/obxectivos"
  }) )
  .get( '/obxectivos', Document({
    "name": "Obxectivos",
    "desc": "Obxectivos da Fundación Expomar",
    "layout": fundacion,
    "document": "public/a-fundacion/obxectivos.md",
  }) )
  .get( '/historia', Document({
    "name": "Historia",
    "desc": "Historia da Fundación Expomar",
    "layout": fundacion,
    "document": "public/a-fundacion/historia.md"
  }) )
  .get( '/estrutura', Layout({
    "name": "Estrutura",
    "desc": "Estrutura da Fundación Expomar",
    "layout": fundacion.concat( "public/a-fundacion/estrutura.swig.html" ),
    "styles": "public/estrutura.less"
  }) )
);

var romanize = project.require( 'backend/utils' ).romanize
  , format = require( 'util' ).format
;

app
  .get( '/feira-expomar', Layout({
      "name": "Feira Expomar",
      "desc": "Feira monográfica nautico-pesqueira \"Expomar\"",
      "layout": public.concat( "404-working.swig.html" )
  }) )
;

app
  .get( '/produart', Layout({
      "name": "Produart",
      "desc": "Feira de produtos artesáns e ecolóxicos \"Produart\"",
      "layout": public.concat( "404-working.swig.html" )
  }) )
  .get( '/outras-actividades', Layout({
      "name": "Outras Actividades",
      "desc": "Outras actividades desenvoltas pola Fundación Expomar",
      "layout": public.concat( "404-working.swig.html" )
  }) )
;

var xornadas = public.concat( 'public/xornadas/xornadas.swig.html' )
  , aX = project.require( 'data/anosXornadas.json' )
;

app.use(
  '/xornadas-tecnicas',
  express.Router()
  .get( '/', redirect({
    "name": "Xornadas Técnicas",
    "desc": format(
        '%s Xornadas Técnicas "Expomar %s"',
        romanize(aX.length), aX[ aX.length-1 ]
      ),
    "location": "/xornadas-tecnicas/presentacion"
  }) )
  .get('/presentacion', Document({
      "name": "Presentación",
      "desc": "Presentación do evento",
      "layout": xornadas.concat( 'public/presentacion.swig.html' ),
      "document": 'public/xornadas/' + aX[ aX.length-1 ] + '/presentacion.md',
      "anos": aX
  }) )
  .get('/programa', Layout({
      "name": "Programa",
      "desc": "Programa",
      "layout": xornadas
      // temporal, cambiar a documento
      .concat( 'public/xornadas/' + aX[ aX.length-1 ] + '/programa.md' ),
      //"document": 'public/xornadas/' + aX[ aX.length-1 ] + '/programa.md'
    //,"anos": aX
  }) )
  .get('/ponencias', Layout({
      "name": "Ponencias",
      "desc": "Ponencias",
      "layout": xornadas.concat( 'public/xornadas/ponencias.swig.html' ),
      "data": function( callback ){
        iai.project.require('backend/operation/ponencias-xornadas')
        .list( aX[ aX.length-1 ], function( err, data ){
          if( err ){
            return callback( err );
          }
          console.log( "data", data );
          callback( null, data );
        });
      }
  }) )
);

var encontro = public.concat( 'public/encontro/encontro.swig.html' )
  , aE = project.require( 'data/anosEncontro.json' )
;

app.use(
  '/encontro-empresarial',
  express.Router()
  .get( '/', redirect({
    "name": "Encontro Empresarial",
    "desc": "Encontro Empresarial de Organizacións Pesqueiras",
    "location": "/encontro-empresarial/presentacion"
  }) )
  .get('/presentacion', Layout({
      "name": "Presentación",
      "desc": "Presentación do Encontro Empresarial de Organizacións Pesqueiras",
      "layout": encontro.concat( "public/presentacion.swig.html" )
      // temporalmente, tería que ser un doc
      .concat( 'public/encontro/' + aE[ aE.length-1 ] + '/presentacion.md' ),
      //"document": 'public/encontro/' + aE[ aE.length-1 ] + '/presentacion.md',
      "anos": aE
  }) )
);

/**
 * 404 + 410 responses
 */

var NotFound = Layout({
  "name": "Page Not Found",
  "desc": "Page Not Found",
  "layout": public.concat( "404.swig.html" ),
  "styles": "404.less"
});

var oldUrl = project.require('data/old-urls');

app.use(function( req, res, next ){
  res.status(404);

  if( !!~oldUrl.indexOf(req.url) ){
    res.status(410);
  }

  NotFound( req, res, next );
});

/**
 * 500 responses
 */

var ServerError = Layout({
  "name": "Internal Server Error",
  "desc": "An unexpected error was thrown",
  "layout": public.concat( "500.swig.html" )
});

app.use(function( err, req, res, next ){
  console.error( err.stack );
  res.status( 500 );

  if( ! iai.production ){
    res.locals.error = err;
  }

  ServerError( req, res, next );
})
