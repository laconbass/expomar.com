var resolve = require('path').resolve.bind( 0, process.cwd() )
  , assert = require('assert')
  , fs = require('fs')
  , f = require('util').format
  , slice = Array.prototype.slice.call.bind( Array.prototype.slice )
  , production = process.env.NODE_ENV === 'production'
;

function debug(){
  if( production ){
    return;
  }
  console.error( 'translator:', f.apply(0, arguments) );
};

function isObject( o ){
  return Object.prototype.toString.call(o) === '[object Object]';
}

var files = {
  gl: resolve('locale/strings-gl.json'),
  en: resolve('locale/strings-en.json'),
  es: resolve('locale/strings-es.json')
};

var langs = Object.keys(files);

var strings = {};
langs.forEach(function( code ){
  debug( 'catching %s strings from %s', code, files[code] );
  strings[ code ] = require( files[code] );
});

module.exports = function t( lang, string, values ){
  assert( arguments.length <= 3, 'bad translator call' );

  // do nothing with empty strings
  if( ! string ) return string;

  // don't check lang exists in production
  if( ! production && !~langs.indexOf(lang) ){
    throw new Error( "Unavailable lang: "+lang )
  }

  // removed util.format features, warn about a bad call
  if( ! production && 'undefined' !== typeof values && ! isObject(values) ){
    debug( 'WARN: translator was called expecting util.format features' );
    debug( 'arguments:', arguments );
    debug( Error('debug trace').stack );
    values = {};
  }

  // removed util.format features, warn to use tag-style
  ! production && ~string.indexOf('%') && debug(
     'WARN: removed util.format features, use tag-style on string:\n'
    +'      "%s"', string
  );

  // auto-add new strings to translation tables
  if( ! production && typeof strings[ lang ][ string ] === 'undefined' ){

    debug( '%s transtable ADD "%s"', lang, string );
    strings[ lang ][ string ] = null;

    var path = resolve( files[lang] );
    fs.writeFileSync( path, JSON.stringify( strings[lang], null, 4 ) );

    debug( '%s transtable REFRESH', lang );
    delete require.cache[ path ];
    strings[ lang ] = require( path );
  }

  var value = strings[ lang ][ string ];
  if( !value && value !== false ){
    debug( '%s transtable MISS "%s"', lang, string );
  }

  string = strings[ lang ][ string ] || string;

  // TODO
  if( ~string.indexOf('{') ){
    values = values || {};
    for( var tag in values ){
      string = string.replace( RegExp('\{'+tag+'\}', 'g'), values[tag] );
      // stop replacing if there are no more tags on string
      if( !~string.indexOf('{') ) break;
    }
  }

  return string;
};
