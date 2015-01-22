var app = require('../app-public');
var layout = [ "theme2.swig.html" ];

//var redirect = require('../middleware/redirect');
var Section = require('../middleware/Section');
var Layout = require('../middleware/Layout');
var Document = require('../middleware/Document');

var romanize = require( '../utils' ).romanize
var format = require( 'util' ).format;
var resolve = require('path').resolve.bind( 0, process.cwd() );

var anos = require( resolve('data/anosFeira.json') );

var exports = module.exports = Section( app, {
  "name": "Feira Expomar",
  "desc": "A Feira monográfica náutico-pesqueira Expomar ao detalle, dende a súa primeira edición en 1994 ata a actualidade.",
  "layout": [] //?? é lóxico ou non?
});

var actual = anos[ anos.length - 1 ];
var romano = romanize( anos.length );
var largo = romano +" edición da Feira monográfica náutico-pesqueira EXPOMAR";
var pasado = anos[ anos.length - 2 ];

exports
  .get( '/', Layout({
    "name": "Expomar "+ actual,
    "desc": largo,
    "layout": layout.concat( 'public/feira/portada.swig.html' )
  }) )
  .get('/presentacion', Document({
      "name": "Presentación",
      "desc": "Presentación da " + largo,
      "layout": layout.concat( "public/presentacion.swig.html" ),
      "document": {
        gl: 'public/feira/' + actual + '/presentacion.md'
      },
      "anos": anos
  }) )
/*  .get('/programa', Document({
      "name": "Programa",
      "desc": "Programa",
      "layout": layout,
      "document": {
        gl: 'public/encontro/' + actual + '/programa.md'
      }
    //,"anos": aX
  }) )*/
  .get('/comite', Layout({
      "name": "Comité Executivo",
      "desc": "Persoas que conforman o Comité Executivo da " + largo,
      "layout": layout.concat( 'public/comite-executivo.swig.html' )
  }) )
  /*.get('/organizacions', Layout({
      "name": "Organizacións Invitadas",
      "desc": "Listado de organizacións invitadas ao Encontro Empresarial de Organizacións Pesqueiras",
      "layout": layout.concat( 'public/encontro/' + actual + '/organizacions.md' ),
  }) )*/
  .get('/documentacion-expositores', Layout({
      "name": "Documentación",
      "desc": "Documentación para entidades expositoras " + largo,
      "layout": layout.concat( 'public/feira/' + actual + '/documentacion.swig.html' )
  }) )
;
