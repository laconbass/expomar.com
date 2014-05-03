var iai = require( '../../iai' )
  , is = iai( 'is' )
  , flow = require( '../../iai-flow' )
  , fs = require( 'fs' )
;

/**
 * @function generate: generates site content from data folders
 */

var readdir = flow( 'expomar.com:generator:readdir' )
  .step(function( data_src, callback ){
    callback.debug( 'checking source directory...' )
    if( ! is.AbsolutePath(data_src) ){
      return callback( Error('Please input source path as absolute path') );
    }
    callback( null, data_src );
  })
  .step( fs.stat )
  .step(function( stats, callback ){
    if( ! stats.isDirectory() ){
      return callback( Error('source must be a directory') );
    }
    callback.debug( 'Ok. Reading directory...' )
    callback( null, callback.calls[0][0] );
  })
  .step( fs.readdir )
;

var generate = flow( 'expomar.com:generator' )
  .step(function( data_src, callback ){
    callback.debug( 'Reading data source...' )
    callback( null, data_src );
  })
  .step( readdir )
  .step(function( files, callback ){
    callback.debug( 'Ok. Inspecting folder contents...' )
    var anos = {}
    files
      .filter(function( val ){ return val.match(/\d{4}/) })
      .forEach(function( val ){ anos[val] = callback.calls[0][0] + '/' + val })
    ;
    callback( null, anos );
  })
  .stepping(function( key, file, callback ){
    readdir( file, callback );
  })
  .step(function( results, callback ){
    callback.debug( 'Ok. Processing contents by year...' )
    callback( null, results, callback.calls[0][0] );
  })
  .stepping(function( year, files, dirname, callback ){
    console.log( "atopouse información do ano", year );

    var log = console.log.bind( console, "  " )
      , dirname = dirname+'/'+year
    ;

    if( !!~files.indexOf('comite.md') ){
      console.log( "  atopouse comite.md" );
    } else {
      console.log( "  non se atopou comite.md" );
    }

    if( !!~files.indexOf('feira') ){
      console.log( "  atopouse información sobre a feira expomar", year );
      //generateFeira( dirname+'/xornadas', callback.split() )
    }
    if( !!~files.indexOf('xornadas') ){
      console.log( "  atopouse información sobre as xornadas técnicas", year );
      generateXornadas( dirname+'/xornadas', callback.split() )
    }
    if( !!~files.indexOf('encontro') ){
      console.log( "  atopouse información sobre o encontro empresarial", year );
      //generateEncontro( dirname+'/encontro', callback.split() )
    }
    //callback( null );
  })
;

var generateXornadas = flow( 'expomar.com:generator:xornadas' )
  .step( readdir )
  .step(function( files, callback ){
    if( !!~files.indexOf('presentacion.md') ){
      console.log( "    atopouse a presentacion" )
    } else {
      console.log( "    non se atopou a presentacion" );
    }
    callback( files, null );
  })
  .step(function( files, callback ){
    if( !!~files.indexOf('programa.md') ){
      console.log( "    atopouse o programa" )
    } else {
      console.log( "    non se atopou o programa" );
    }
    callback( files, null );
  })
;

module.exports = generate.bind( null, __dirname + '/../data', function( err ){
  //console.log( "hola?", err )
  if( err ){
    throw err;
  }
  //console.dir( arguments )
  console.log( "finished" )
})
