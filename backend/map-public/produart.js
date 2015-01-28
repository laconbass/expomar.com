var app = require('../app-public');
var layout = [ "theme2.swig.html", "public/produart/produart.swig.html" ];

var redirect = require('../middleware/redirect');
var Section = require('../middleware/Section');
var Layout = require('../middleware/Layout');
var Document = require('../middleware/Document');

var romanize = require( '../utils' ).romanize;
var format = require( 'util' ).format;
var resolve = require('path').resolve.bind( 0, process.cwd() );

var anos = require( resolve('data/anosProduart.json') );

module.exports = Section( app, {
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
      "layout": layout,
      "document": {
        gl: 'public/produart/' + anos[ anos.length-1 ] + '/presentacion.md',
        es: 'public/produart/' + anos[ anos.length-1 ] + '/presentacion-es.md'
      },
      "anos": anos
  }) )
  .get('/inscricion', Document({
      "name": "Inscrición",
      "desc": "Información sobre a inscrición",
      "layout": layout,
      "document": {
        gl: 'public/produart/' + anos[ anos.length-1 ] + '/inscricion.md',
        es: 'public/produart/' + anos[ anos.length-1 ] + '/inscricion-es.md'
      }
  }) )
;
