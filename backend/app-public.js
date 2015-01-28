var resolve = require('path').resolve.bind( 0, process.cwd() )
  , express = require( 'express' )
  , app = express.Router()
  , debug = require( 'debug' )( 'expomar.com:public' )
  , f = require('util').format
  , utils = require( './utils' )
  , t = require('./translator')
;

module.exports = app;

//
// Middleware
//

function menuTop( menu ){
  var menus = { gl: menu };
  ['es', 'en' ].forEach(function( code ){
    menus[ code ] = menu.map(function(link){
      return {
        href: link.href,
        text: t( code, link.text ),
        title: link.title
      };
    });
  });
  return function( req, res, next ){
    console.log( req.lang );
    res.locals.menuTop = menus[ req.language ];
    next();
  };
}

app
  .use( require('./middleware/messages')() )
  .use(function( req, res, next ){
    res.locals.location = req.url;
    res.locals.url = utils.url;
    next();
  })
  .use( require('./middleware/i18n')( 'gl', ['es', 'en'], t ) )
  .use( require('./middleware/breadcumbs')( app ) )
  .use( menuTop([
    { href: "/a-fundacion", text: 'A Fundación', title: 'no title' },
    { href: "/feira-expomar", text: 'Feira Expomar', title: 'no title' },
    { href: "/xornadas-tecnicas", text: 'Xornadas Técnicas', title: 'no title' },
    { href: "/encontro-empresarial", text: 'Encontro Empresarial', title: 'no title' },
    { href: "/produart", text: 'Produart', title: 'no title' }
  ]) );
;

//
// Routes
//

var Layout = require( './middleware/Layout' )
  , Document = require( './middleware/Document' )
  , Section = require( './middleware/Section' )
  , redirect = require( './middleware/redirect' )
;
var public = [ "theme2.swig.html" ];

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

app.use( '/feira-expomar', require('./map-public/feira-expomar') );
app.use( '/xornadas-tecnicas', require('./map-public/xornadas-tecnicas') );
app.use( '/encontro-empresarial', require('./map-public/encontro-empresarial') );
app.use( '/a-fundacion', require('./map-public/a-fundacion') );
app.use( '/produart', require('./map-public/produart') );

//
// 404-working

app
  .get( '/feira-expomar', Layout({
      "name": "Feira Expomar",
      "desc": "Feira monográfica nautico-pesqueira \"Expomar\"",
      "layout": public.concat( "404-working.swig.html" )
  }) )
  .get( '/outras-actividades', Layout({
      "name": "Outras Actividades",
      "desc": "Outras actividades desenvoltas pola Fundación Expomar",
      "layout": public.concat( "404-working.swig.html" )
  }) )
;

/**
 * 404 + 410 responses
 */

var NotFound = Layout({
  "name": "Page Not Found",
  "desc": "Page Not Found",
  "layout": public.concat( "404.swig.html" ),
  "styles": "404.less"
});

var oldUrl = require( resolve('data/old-urls') );

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

  if( process.env.NODE_ENV !== 'production' ){
    res.locals.error = err;
  }

  ServerError( req, res, next );
})
