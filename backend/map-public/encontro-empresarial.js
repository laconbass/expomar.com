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
var resolve = path.resolve.bind( 0, process.cwd() );
var fs = require('fs');
var assert = require('assert');

var anos = require( resolve('data/anosEncontro.json') );
var history = [];
var inspections = {};

var exports = module.exports = Section( app, {
  'name': 'Encontro Empresarial',
  'desc': 'Toda a información sobre o Encontro Empresarial, dende os seus inicios ata a actualidade'
});


var actual = anos[ anos.length - 1 ];
var base = path.basename( __filename, '.js' );
var coletilla = 'edición do Encontro Empresarial de Organizacións Pesqueiras';

exports
  .get( '/', redirect({
    'name': 'Encontro Empresarial',
    'desc': 'Encontro Empresarial de Organizacións Pesqueiras',
    'location': format( '/%s/%s', base, actual )
  }) )
  // TODO index de todolos anos
  // .get( '/historico' )
;
var templatesdir = resolve( 'templates/public/', base );

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
  // almacenar a info deste ano para o histórico
  history.push(ano);

  // data común a tódalas rutas
  var data = {
    baseUrl: '/'+base,
    namePattern: 'Encontro Empresarial {ano}',
    descPattern: '{romano} ' + coletilla + ' {ano}',
    ultimo: anos[ anos.length - 1 ],
    current: n+1,
    romano: romanize( n+1 ),
    ano: +ano
  };

  // crear a seccion deste ano
  var router = Section( exports, {
    'name': data.namePattern,
    'desc': data.descPattern,
    'data': data
  });

  // redireccionar a raíz á presentación
  router.get( '/', redirect({
    'name': data.namePattern,
    'desc': data.descPattern,
    'data': data,
    'location': format( '/%s/%s/presentacion', base, ano )
  }) );

  // esto non encaixa coa maneira de inspeccionar (debería usar #all)
  // unha solucion posible é meter un midleware que modifique o req.url
  exports.use( '/'+ano, router );

  var tplbase = path.join( 'public', base, ano );
  function routeDocument( docname, details ){
    var ext = path.extname(docname);
    assert( ext === '.md', 'document routes must be .md documents' );

    // checkear que existe polo menos o documento principal
    var fspath = path.join( templates, docname );
    if( ! fs.existsSync(fspath) ){
      console.error( '  SKIP ENOENT "%s"', fspath );
      return;
    }

    // xa que existe o principal, engadir as traduccións que existan
    var doc = { gl: path.join( tplbase, docname ) };
    var extra = ['es', 'en'];
    extra.map(function( code ){
        return path.basename(docname, ext) + '-' + code + ext;
      })
      .forEach(function( filename, n ){
        var fspath = path.join( templates, filename );
        if( ! fs.existsSync(fspath) ){
          return console.error( '  SKIP ENOENT "%s"', fspath );
        }
        doc[ extra[n] ] = path.join( tplbase, filename );
      })
    ;

    // preparar os detalles da Vista para a súa creación
    details = details || {};
    details.data = data;
    details.layout = details.layout || 'public/article.swig.html';
    details.layout = layout.concat(details.layout);
    details.document = doc;

    // routear o Documento en base ao nome do arquivo
    var url = path.join( '/', path.basename(docname, ext) );
    router.get( url, Document(details) );
  }

  routeDocument('presentacion.md', {
    'name': 'Presentación',
    'desc': 'Presentación do ' + data.descPattern,
    'layout': 'public/presentacion.swig.html'
  });

  // TODO debera checkearse que existe o comité de `ano` en vez de reusar o actual
  router.get('/comite', Layout({
    'name': 'Comité Executivo',
    'desc': 'Listado de integrantes do Comité Executivo do ' + data.descPattern,
    'data': data,
    'layout': layout.concat( 'public/comite-executivo.swig.html' )
  }) );

  routeDocument('programa.md', {
    'name': 'Programa',
    'desc': 'Programa do ' + data.descPattern,
  }); 

  routeDocument('organizacions.md', {
    'name': 'Organizacións Invitadas',
    'desc': 'Listado de organizacións invitadas ao ' + data.descPattern
  }); 

  routeDocument('conclusions.md', {
    'name': 'Organizacións Invitadas',
    'desc': 'Conclusións do ' + data.descPattern
  }); 

  // routear histórico
  // Note: sort operates over the original array
  function desc( a, b ){ return b-a; }
  data.history = anos.slice(0, n).sort( desc );
  data.hasdata = {};
  history
    .slice(0).sort( desc )
    .forEach(function( ano, n ){
      data.hasdata[ ano ] = inspections[ ano ];
    })
  ;
  router.get('/historico', Layout({
    'name': 'Histórico',
    'desc': 'Sección dende a que pode acceder a toda a información dispoñible sobre as edicións anteriores',
    'data': data,
    'layout': layout.concat( 'public/historico.swig.html' )
  }) );

  console.error( 'ROUTED /%s/%s', base, ano );
  inspections[ano] = router.view.inspect();
});
