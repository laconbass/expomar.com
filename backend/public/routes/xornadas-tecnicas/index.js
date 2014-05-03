var iai = require('iai')
  , oop = iai('oop')
  , romanize = iai.project.require( 'backend/utils' ).romanize
;

module.exports = iai('core/Fs')( __dirname )
  .name( "Xornadas Técnicas" )
  .layout( "public-evento.swig.html" )

oop( module.exports )
  .accessor( 'anos', function(){
    return this.findById('historico').items;
  })
  .accessor( 'desc', function(){
    return romanize( this.anos.length )+" "+this.name
  })
  .accessor( 'last', function(){
    return this.anos[ this.anos.length - 1 ];
  })
;
