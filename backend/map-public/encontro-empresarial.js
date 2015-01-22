var app = require('../app-public');
var layout = [ "theme2.swig.html", "public/encontro/encontro.swig.html" ];

var redirect = require('../middleware/redirect');
var Section = require('../middleware/Section');
var Layout = require('../middleware/Layout');
var Document = require('../middleware/Document');

var romanize = require( '../utils' ).romanize
var format = require( 'util' ).format;
var resolve = require('path').resolve.bind( 0, process.cwd() );

var anos = require( resolve('data/anosEncontro.json') );

module.exports = Section( app, {
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
      "layout": layout.concat( "public/presentacion.swig.html" ),
      "document": {
        gl: 'public/encontro/' + anos[ anos.length-1 ] + '/presentacion.md'
      },
      "anos": anos
  }) )
  .get('/programa', Document({
      "name": "Programa",
      "desc": "Programa",
      "layout": layout,
      "document": {
        gl: 'public/encontro/' + anos[ anos.length-1 ] + '/programa.md'
      }
    //,"anos": aX
  }) )
  .get('/comite', Layout({
      "name": "Comité Executivo",
      "desc": "Listado de integrantes do Comité Executivo do Encontro Empresarial de Organizacións Pesqueiras",
      "layout": layout.concat( 'public/comite-executivo.swig.html' )
  }) )
  .get('/organizacions', Layout({
      "name": "Organizacións Invitadas",
      "desc": "Listado de organizacións invitadas ao Encontro Empresarial de Organizacións Pesqueiras",
      "layout": layout.concat( 'public/encontro/' + anos[ anos.length-1 ] + '/organizacions.md' ),
  }) )
  .get('/conclusions', Document({
      "name": "Conclusións",
      "desc": "Conclusións do Encontro Empresarial de Organizacións Pesqueiras",
      "layout": layout,
      "document": {
        es: 'public/encontro/' + anos[ anos.length-1 ] + '/conclusions-es.md'
      }
  }) )
;
