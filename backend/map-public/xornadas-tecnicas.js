var app = require('../app-public');
var layout = [ "theme2.swig.html", "public/xornadas/xornadas.swig.html" ];

var redirect = require('../middleware/redirect');
var Section = require('../middleware/Section');
var Layout = require('../middleware/Layout');
var Document = require('../middleware/Document');

var romanize = require( '../utils' ).romanize
var format = require( 'util' ).format;
var resolve = require('path').resolve.bind( 0, process.cwd() );

var anos = require( resolve('data/anosXornadas.json') );
var xOps = require('../operation/xornadas');

module.exports = Section( app, {
  "name": "Xornadas Técnicas",
  "desc": "Toda a información sobre as Xornadas Técnicas, dende os seus inicios ata a actualidade"
})
  .get( '/', redirect({
    "name": "Xornadas Técnicas",
    "desc": format(
        '%s Xornadas Técnicas "Expomar %s"',
        romanize(anos.length), anos[ anos.length-1 ]
      ),
    "location": "/xornadas-tecnicas/presentacion"
  }) )
  .get('/presentacion', Document({
      "name": "Presentación",
      "desc": "Presentación do evento",
      "layout": layout.concat( 'public/presentacion.swig.html' ),
      "document": {
        gl: 'public/xornadas/' + anos[ anos.length-1 ] + '/presentacion.md',
      },
      "anos": anos
  }) )
  .get('/programa', Document({
      "name": "Programa",
      "desc": "Programa",
      "layout": layout,
      "document": {
        gl: 'public/xornadas/' + anos[ anos.length-1 ] + '/programa.md'
      }
    //,"anos": anos
  }) )
  .get('/comite', Layout({
      "name": "Comité Executivo",
      "desc": "Listado de integrantes do Comité Executivo das Xornadas Técnicas",
      "layout": layout.concat( 'public/comite-executivo.swig.html' )
  }) )
  .get('/ponencias', Layout({
      "name": "Ponencias",
      "desc": "Nesta sección pode consultar toda a información referente aos relatores das Xornadas Técnicas e os seus relatorios, que na meirande parte dos casos atópanse dispoñíbeis para a descarga.",
      "layout": layout.concat( 'public/xornadas/ponencias.swig.html' ),
      "styles": "public/ponencias.less",
      "operation": xOps.getPonencias.bind( null, anos[ anos.length-1 ] )
  }) )
;
