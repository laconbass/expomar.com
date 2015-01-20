var read = require( './read' )
  , f = require( 'util' ).format
  , url = require( '../utils' ).url
  , map = require( 'async' ).map
  , production = process.env.NODE_ENV === 'production'
  , resolve = require('path').resolve
;

var path = {
  talk: {
    data: "data/xornadas/%s/ponentes.json",
    static: "files/%s/ponencias-xornadas-tecnicas"
  }
};

path.talk.url = url( 'static', f('/%s/%s', path.talk.static) );
path.talk.file = resolve( process.cwd(), 'static', path.talk.static, '%s' );

var fields = {
  url: [ "photo_filename", "slideshow_filename" ],
  read: [ /*"resume_filename",*/ "slideshow_summary_filename" ]
}

exports.getPonencias = function( year, callback ){
  try {
    var dry = resolve( process.cwd(), f(path.talk.data, year) );
    if( !production ){
      delete require.cache[ dry ];
    }
    var data = require( dry );
  } catch( err ){
    return callback( err );
  }

  // add urls
  data = data.map(function( ponente ){
    fields.url.forEach(function( key ){
      ponente[ key.replace(/_filename$/, '_url') ] = ponente[ key ]
        ? f( path.talk.url, year, ponente[ key ] )
      : ""
      ;
    });
    return ponente;
  });

  map( data, function iterator( ponente, callback ){
    var fieldS = fields.read.filter(function( key ){
      return !!ponente[ key ];
    });

    if( !fieldS.length ){
      return callback( null, ponente );
    }

    var files = fieldS.map(function( key ){
        return f( path.talk.file, year, ponente[ key ] );
    });
    map( files, read.file.bind(null, 'static'), function complete( err, results ){
      if( err ){
        return callback( err );
      }
      fieldS.forEach(function( key, i ){
        ponente[ key.replace(/_filename$/, '') ] = results[ i ];
      });
      callback( null, ponente );
    });
  }, callback );
};
