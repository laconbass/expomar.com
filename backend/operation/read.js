var fs = require( 'fs' )
  , resolve = require('path').resolve
  , slice = Function.prototype.call.bind( Array.prototype.slice )
;

exports.file = function( filename, resolve2, resolveN, callback ){
  callback = arguments[ arguments.length -1 ];
  filename = resolve.apply( 0, slice(arguments, 0, -1) );
  fs.readFile( filename, { encoding: 'utf8' }, callback );
};

exports.dir = function( dirname, resolve2, resolveN, callback ){
  callback = arguments[ arguments.length -1 ];
  dirname = resolve.apply( 0, slice(arguments, 0, -1) );
  fs.readdir( dirname, callback );
}
