var resolve = require('path').resolve.bind( 0, process.cwd() )
  , express = require( 'express' )
  , app = express.Router()
  , debug = require( 'debug' )( 'expomar.com:public' )
  , f = require('util').format
  , utils = require( './utils' )
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
  .use(function( req, res, next ){
    res.locals.location = req.url;
    res.locals.url = utils.url;
    next();
  })
  .use( require('./middleware/i18n')( 'gl', ['es', 'en'], require('./translator') ) )
  .use( require('./middleware/breadcumbs')( app ) )
  .use( menuTop({
    "/a-fundacion": { text: 'A Fundación' },
    "/feira-expomar": { text: 'Feira Expomar' },
    "/xornadas-tecnicas": { text: 'Xornadas Técnicas' },
    "/encontro-empresarial": { text: 'Encontro Empresarial' },
    "/produart": { text: 'Produart' }
  }) );
;

//
// View Controllers
//

var Controller = require( './middleware/Controller' )
  , Layout = require( './middleware/Layout' )
  , Document = require( './middleware/Document' )
  , Section = require( './middleware/Section' )
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


//
// Routes
//

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

var fundacion = public.concat( "public/a-fundacion/a-fundacion.swig.html" );

app.use(
  '/a-fundacion',
  Section( app, {
    "name": "A Fundación Expomar",
    "desc": "Información sobre a Fundación Expomar (Historia, Obxectivos, ...)"
  })
  .get( '/', redirect({
    "name": "A Fundación",
    "desc": "A Fundación Expomar",
    "location": "/a-fundacion/obxectivos"
  }) )
  .get( '/obxectivos', Document({
    "name": "Obxectivos",
    "desc": "Obxectivos da Fundación Expomar",
    "layout": fundacion,
    "document": {
      gl: "public/a-fundacion/obxectivos-gl.md",
      es: "public/a-fundacion/obxectivos-es.md"
    }
  }) )
  .get( '/historia', Document({
    "name": "Historia",
    "desc": "Historia da Fundación Expomar",
    "layout": fundacion,
    "document": {
      gl: "public/a-fundacion/historia-gl.md",
    }
  }) )
  .get( '/estrutura', Layout({
    "name": "Estrutura",
    "desc": "Estrutura da Fundación Expomar",
    "layout": fundacion.concat( "public/a-fundacion/estrutura.swig.html" ),
    "styles": "public/estrutura.less"
  }) )
);

var romanize = require( './utils' ).romanize
  , format = require( 'util' ).format
;

//
// 404-working
//

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

var xornadas = public.concat( 'public/xornadas/xornadas.swig.html' )
  , aX = require( resolve('data/anosXornadas.json') )
  , xOps = require('./operation/xornadas')
;

app.use(
  '/xornadas-tecnicas',
  Section( app, {
    "name": "Xornadas Técnicas",
    "desc": "Toda a información sobre as Xornadas Técnicas, dende os seus inicios ata a actualidade"
  })
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
      "document": {
        gl: 'public/xornadas/' + aX[ aX.length-1 ] + '/presentacion.md',
      },
      "anos": aX
  }) )
  .get('/programa', Document({
      "name": "Programa",
      "desc": "Programa",
      "layout": xornadas,
      "document": {
        gl: 'public/xornadas/' + aX[ aX.length-1 ] + '/programa.md'
      }
    //,"anos": aX
  }) )
  .get('/comite', Layout({
      "name": "Comité Executivo",
      "desc": "Listado de integrantes do Comité Executivo das Xornadas Técnicas",
      "layout": xornadas.concat( 'public/comite-executivo.swig.html' )
  }) )
  .get('/ponencias', Layout({
      "name": "Ponencias",
      "desc": "Nesta sección pode consultar toda a información referente aos relatores das Xornadas Técnicas e os seus relatorios, que na meirande parte dos casos atópanse dispoñíbeis para a descarga.",
      "layout": xornadas.concat( 'public/xornadas/ponencias.swig.html' ),
      "styles": "public/ponencias.less",
      "data": xOps.getPonencias.bind( null, aX[ aX.length-1 ] )
  }) )
);

var encontro = public.concat( 'public/encontro/encontro.swig.html' )
  , aE = require( resolve('data/anosEncontro.json') )
;

app.use(
  '/encontro-empresarial',
  Section( app, {
    "name": "Encontro Empresarial",
    "desc": "Toda a información sobre o Encontro Empresarial, dende os seus inicios ata a actualidade"
  })
  .get( '/', redirect({
    "name": "Encontro Empresarial",
    "desc": "Encontro Empresarial de Organizacións Pesqueiras",
    "location": "/encontro-empresarial/presentacion"
  }) )
  .get('/presentacion', Document({
      "name": "Presentación",
      "desc": "Presentación do Encontro Empresarial de Organizacións Pesqueiras",
      "layout": encontro.concat( "public/presentacion.swig.html" ),
      "document": {
        gl: 'public/encontro/' + aE[ aE.length-1 ] + '/presentacion.md'
      },
      "anos": aE
  }) )
  .get('/programa', Document({
      "name": "Programa",
      "desc": "Programa",
      "layout": encontro,
      "document": {
        gl: 'public/xornadas/' + aX[ aX.length-1 ] + '/programa.md'
      }
    //,"anos": aX
  }) )
  .get('/comite', Layout({
      "name": "Comité Executivo",
      "desc": "Listado de integrantes do Comité Executivo do Encontro Empresarial de Organizacións Pesqueiras",
      "layout": encontro.concat( 'public/comite-executivo.swig.html' )
  }) )
  .get('/organizacions', Layout({
      "name": "Organizacións Invitadas",
      "desc": "Listado de organizacións invitadas ao Encontro Empresarial de Organizacións Pesqueiras",
      "layout": encontro.concat( 'public/encontro/' + aE[ aE.length-1 ] + '/organizacions.md' ),
  }) )
  .get('/conclusions', Document({
      "name": "Conclusións",
      "desc": "Conclusións do Encontro Empresarial de Organizacións Pesqueiras",
      "layout": encontro,
      "document": {
        es: 'public/encontro/' + aX[ aX.length-1 ] + '/conclusions-es.md'
      }
  }) )
);

var produart = public.concat( 'public/produart/produart.swig.html' )
  , aP = require( resolve('data/anosProduart.json') )
;

app.use(
  '/produart',
  Section( app, {
    "name": "Produart",
    "desc": "Toda a información sobre Produart, dende os seus inicios ata a actualidade"
  })
  .get( '/', redirect({
    "name": "Produart",
    "desc": "Feira dos Produtos Artesáns e Ecolóxicos",
    "location": "/produart/presentacion"
  }) )
  .get('/presentacion', Document({
      "name": "Presentación",
      "desc": "Presentación de Produart",
      "layout": produart,
      "document": {
        gl: 'public/produart/' + aP[ aP.length-1 ] + '/presentacion.md',
        es: 'public/produart/' + aP[ aP.length-1 ] + '/presentacion-es.md'
      },
      "anos": aP
  }) )
  .get('/inscricion', Document({
      "name": "Inscrición",
      "desc": "Información sobre a inscrición",
      "layout": produart,
      "document": {
        gl: 'public/produart/' + aP[ aP.length-1 ] + '/inscricion.md',
        es: 'public/produart/' + aP[ aP.length-1 ] + '/inscricion-es.md'
      }
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
