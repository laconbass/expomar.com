var app = require('../app-public');
var layout = [ "theme2.swig.html", "public/a-fundacion/a-fundacion.swig.html" ];

var redirect = require('../middleware/redirect');
var Section = require('../middleware/Section');
var Layout = require('../middleware/Layout');
var Document = require('../middleware/Document');

module.exports = Section( app, {
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
    "layout": layout,
    "document": {
      gl: "public/a-fundacion/obxectivos-gl.md",
      es: "public/a-fundacion/obxectivos-es.md"
    }
  }) )
  .get( '/historia', Document({
    "name": "Historia",
    "desc": "Historia da Fundación Expomar",
    "layout": layout,
    "document": {
      gl: "public/a-fundacion/historia-gl.md",
    }
  }) )
  .get( '/estrutura', Layout({
    "name": "Estrutura",
    "desc": "Estrutura da Fundación Expomar",
    "layout": layout.concat( "public/a-fundacion/estrutura.swig.html" ),
    "styles": "public/estrutura.less"
  }) )
;
