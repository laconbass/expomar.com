var swig = require( 'swig' )
  , format = require( 'util' ).format
  , utils = require( './utils' )
  , marked = require( 'marked' )
  , production = process.env.NODE_ENV === 'production'
;

var exports = module.exports = new swig.Swig({
  // see options [here](http://paularmstrong.github.io/swig/docs/api/#SwigOpts)
  autoescape: true,
  cache: production? 'memory' : false,
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

swig.setFilter( 'chunks', function( input, n ){
  n = n || 1;
  if( !input.match ) return input;
  return input.match( RegExp('.{1,'+n+'}', 'g') );
});

function repeat( input, n ){
  return Array( n + 1 ).join( input );
}
repeat.safe = true;
swig.setFilter( 'repeat', repeat );

function debug( input ){
  input = JSON.stringify( input, "[Function]", 4 );
  return format( '<pre>%s</pre>', input );
}
debug.safe = true;
production || swig.setFilter( 'debug', debug );

function link( input, _location ){
  input = input || {};
  input.text = input.text || '¿?';
  input.title = input.title || '¿?';

  var href = input.href || '#'
    , curr = _location || '#'
    , clas = curr.split('/').slice( 0, href.split('/').length ).join('/') === href
  ;
  return format(
    '<a href="%s" title="%s" class="%s">%s</a>',
    href, input.title, clas? 'selected' : '', input.text
  );
}
link.safe = true;
swig.setFilter( 'link', link );


swig.setFilter( 'romanize', utils.romanize );


function markdown( input ){
  return marked( input );
}
markdown.safe = true;
swig.setFilter( 'marked', markdown );
