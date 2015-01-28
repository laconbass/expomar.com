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
var assert = require('assert');

var anos = require( resolve('data/anosXornadas.json') );
var history = [];
var inspections = {};
var xOps = require('../operation/xornadas');

var exports = module.exports = Section( app, {
  'name': 'Xornadas Técnicas',
  'desc': 'Toda a información sobre as Xornadas Técnicas, dende os seus inicios ata a actualidade'
});

var actual = anos[ anos.length - 1 ];
var base = path.basename( __filename, '.js' );
var coletilla = 'edición das Xornadas Técnicas Expomar';

exports
  .get( '/', redirect({
    'name': 'Xornadas Técnicas',
    'desc': 'Toda a información sobre as Xornadas Técnicas, dende os seus inicios ata a actualidade',
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
    namePattern: 'Xornadas Técnicas {ano}',
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

  // esto non encaixa coa maneira de inspeccionar (debería usar #all)
  // unha solucion posible é meter un midleware que modifique o req.url
  exports.use( '/'+ano, router );

  // redireccionar a raíz á presentación
  router.get( '/', redirect({
    'name': data.namePattern,
    'desc': data.descPattern,
    'data': data,
    'location': format( '/%s/%s/presentacion', base, ano )
  }) );

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
    'desc': 'Presentación da ' + data.descPattern,
    'layout': 'public/presentacion.swig.html'
  });

  // TODO debera checkearse que existe o comité de `ano` en vez de reusar o actual
  router.get('/comite', Layout({
    'name': 'Comité Executivo',
    'desc': 'Persoas que conforman o Comité Executivo da ' + data.descPattern,
    'data': data,
    'layout': layout.concat( 'public/comite-executivo.swig.html' )
  }) );

  routeDocument('programa.md', {
    'name': 'Programa',
    'desc': 'Programa da ' + data.descPattern,
  }); 

  // routear relatorios
  // TODO decidir que argallo coa forma de cargar a info en json
  var file = resolve( 'static/files/', ano, 'ponentes.json' );
  if( fs.existsSync(file) ){
    router.get('/relatorios', Layout({
        'name': 'Relatorios',
        'desc': 'Nesta sección pode consultar toda a información referente aos relatores das Xornadas Técnicas e os seus relatorios, que na meirande parte dos casos atópanse dispoñíbeis para a descarga.',
        'layout': layout.concat( path.join('public', base, 'ponencias.swig.html') ),
        'data': data,
        'operation': xOps.getPonencias.bind( null, ano )
    }) );
  } else {
    console.error( '  SKIP ENOENT "%s"', file );
  }

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
