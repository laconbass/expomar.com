var app = ( require.main === module )
  ? require( 'express' ).Router()
  : require( '../app-public' )
;
var layout = [ 'theme2.swig.html' ];

var redirect = require('../middleware/redirect');
var Section = require('../middleware/Section');
var Layout = require('../middleware/Layout');
var Document = require('../middleware/Document');

var romanize = require( '../utils' ).romanize
var format = require( 'util' ).format;
var path = require('path');
var fs = require('fs');
var resolve = path.resolve.bind( 0, process.cwd() );

var anos = require( resolve('data/anosFeira.json') );

var exports = module.exports = Section( app, {
  'name': 'Feira Expomar',
  'desc': 'A Feira monográfica náutico-pesqueira Expomar ao detalle, dende a súa primeira edición en 1994 ata a actualidade.',
  'layout': [] // TODO?? é lóxico ou non?
});

var actual = anos[ anos.length - 1 ];
var base = path.basename( __filename, '.js' );
var coletilla = 'edición da feira monográfica náutico-pesqueira Expomar';

exports
  .get( '/', redirect({
    'name': 'Feira Expomar',
    'desc': 'A Feira monográfica náutico-pesqueira Expomar ao detalle, dende a súa primeira edición en 1994 ata a actualidade.',
    'location': format( '/%s/%s', base, actual )
  }) )
  // TODO index de todolos anos
  // .get( '/historico' )
;
var templatesdir = resolve('templates/public/feira');
anos.forEach(function( ano, n ){
  console.error( 'ROUTING /%s/%s', base, ano );
  // checkear que existe información deste ano
  var templates = path.join( templatesdir, ano );
  try {
    var files = fs.readdirSync( templates );
  } catch( e ){
    if( e.code === 'ENOENT' ){
      console.error( '  ABORT ENOENT "%s"', templates );
      return;
    }
    throw e;
  }
  if( !files.length ){
    console.error( '  ABORT EMPTY "%s"', templates );
    return;
  }
  var file = path.join( templates, 'presentacion.md' );
  if( ! fs.existsSync(file) ){
    console.error( '  ABORT ENOENT "%s"', file );
    return;
  }

  // a partir deste punto está claro que como mínimo existe presentacion.md

  var data = { ano: ano, romano: romanize( n+1 ) };
  var router = Section( exports, {
    'name': 'Feira Expomar {ano}',
    'desc': '{romano} ' + coletilla + ' {ano}',
    'data': data
  });

  // esto non encaixa coa maneira de inspeccionar (debería usar #all)
  // unha solucion posible é meter un midleware que modifique o req.url
  exports.use( '/'+ano, router );

  // redireccionar a raíz á presentación
  router.get( '/', redirect({
    'name': 'Feira Expomar {ano}',
    'desc': '{romano} ' + coletilla + ' {ano}',
    'data': data,
    'location': format( '/%s/%s/presentacion', base, ano )
  }) );

  // routear a presentación
  var documents = { gl: 'public/feira/'+ano+'/presentacion.md' };
  // TODO DRY checkeo da existencia de cada traducción menos zarapalleiro
  var file = path.join( templates, 'presentacion-es.md' );
  if( fs.existsSync(file) ) documents.es = 'public/feira/'+ano+'/presentacion-es.md';
  var file = path.join( templates, 'presentacion-en.md' );
  if( fs.existsSync(file) ) documents.en = 'public/feira/'+ano+'/presentacion-en.md';
  // TODO checkear si existen traduccións e engadilas
  router.get('/presentacion', Document({
      'name': 'Presentación',
      'desc': 'Presentación da {romano} ' + coletilla + ' {ano}',
      'data': data,
      // TODO ¿? presentación especial para a feira
      'layout': layout.concat( 'public/presentacion.swig.html' ),
      'document': documents,
  }) );

  // a partir deste punto hai que checkear que exista cada sección

  // TODO isto pode facerse cun forEach ¿?
  // TODO skiped cause probably premature optimization
  var file = path.join( templates, 'programa.md' );
  if( fs.existsSync(file) ){
    var documents = { gl: 'public/feira/'+ano+'/programa.md' };
    // TODO DRY checkeo da existencia de cada traducción menos zarapalleiro
    var file = path.join( templates, 'programa-es.md' );
    if( fs.existsSync(file) ) documents.es = 'public/feira/'+ano+'/programa-es.md';
    var file = path.join( templates, 'programa-en.md' );
    if( fs.existsSync(file) ) documents.en = 'public/feira/'+ano+'/programa-en.md';
    router.get('/programa', Document({
        'name': 'Programa',
        'desc': 'Programa da {romano} ' + coletilla + ' {ano}',
        'data': data,
        'layout': layout,
        'document': documents,
    }) ); 
  } else {
    console.error( '  SKIP ENOENT "%s"', file );
  }
  /*.get('/organizacions', Layout({
      'name': 'Organizacións Invitadas',
      'desc': 'Listado de organizacións invitadas ao Encontro Empresarial de Organizacións Pesqueiras',
      'layout': layout.concat( 'public/encontro/' + actual + '/organizacions.md' ),
  }) )*/
  var file = path.join( templates, 'documentacion.swig.html' );
  if( fs.existsSync(file) ){
    router.get('/documentacion', Layout({
        'name': 'Documentación',
        'desc': 'Documentación para entidades expositoras en Expomar {ano}',
        'data': data,
        'layout': layout.concat( 'public/feira/' + actual + '/documentacion.swig.html' )
    }) );
  } else {
    console.error( '  SKIP ENOENT "%s"', file );
  }

  // routear o comite
  // TODO debera checkearse que existe o comité de `ano` en vez de reusar o actual
  router.get('/comite', Layout({
      'name': 'Comité Executivo',
      'desc': 'Persoas que conforman o Comité Executivo da {romano} ' + coletilla + ' {ano}',
      'data': data,
      'layout': layout.concat( 'public/comite-executivo.swig.html' )
  }) );

  console.error( 'ROUTED /%s/%s', base, ano );
});

