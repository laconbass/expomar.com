var resolve = require('path').resolve.bind( 0, process.cwd() )
  , debug = require('debug')('iai:translator')
  , fs = require('fs')
  , f = require('util').format
  , slice = Array.prototype.slice.call.bind( Array.prototype.slice )
  , production = process.env.NODE_ENV === 'production'
;


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

module.exports = function t( lang, string ){

  if( ! string ){
    return string;
  }

  if( !production && !~langs.indexOf(lang) ){
    throw new Error( "Unavailable lang: "+lang )
  }

  // auto-add new strings to translation tables
  if( ! production && typeof strings[ lang ][ string ] == 'undefined' ){

    debug( '%s transtable ADD "%s"', lang, string );
    strings[ lang ][ string ] = null;

    var path = project.resolve( files[lang] );
    fs.writeFileSync( path, JSON.stringify( strings[lang], null, 4 ) );

    debug( '%s transtable REFRESH', lang );
    delete require.cache[ path ];
    strings[ lang ] = require( path );
  }

  if( ! strings[ lang ][ string ] ){
    debug( '%s transtable MISS "%s"', lang, string );
  }

  string = strings[ lang ][ string ] || string;

  // provide util.format features
  if( arguments.length > 2 ){
    return f.apply( f, [ string ].concat( slice(arguments, 2) ) );
  }

  return string;
};
