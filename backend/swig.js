var iai = require( '../../iai' )
  , swig = require( 'swig' )
  , utils = require( './utils' )
  , marked = require( 'marked' )
;

var exports = module.exports = new swig.Swig({
  // see options [here](http://paularmstrong.github.io/swig/docs/api/#SwigOpts)
  autoescape: true,
  cache: iai.production? 'memory' : false,
  locals: {
    selected: function( condition ){
      return condition? ' class="selected"' : '';
    }
  }
});

var translator = require('./translator');
function tFilter( input, lang ){
  return translator( lang, input );
}
tFilter.safe = true;
swig.setFilter( 't', tFilter );


swig.setFilter( 'trim', function( input ){
  if( !input.trim ){
    return input;
  }
  return input.trim();
});


swig.setFilter( 'romanize', utils.romanize );


function markdown( input ){
  return marked( input );
}
markdown.safe = true;
swig.setFilter( 'marked', markdown );
