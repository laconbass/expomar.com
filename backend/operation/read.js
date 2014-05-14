var iai = require( '../../../iai' )
  , fs = require( 'fs' )
  , slice = Function.prototype.call.bind( Array.prototype.slice )
;

exports.file = function( filename, resolve2, resolveN, callback ){
  callback = arguments[ arguments.length -1 ];
  filename = iai.project.resolve.apply( filename, slice(arguments, 0, -1) );
  fs.readFile( filename, { encoding: 'utf8' }, callback );
};

exports.dir = function( dirname, resolve2, resolveN, callback ){
  callback = arguments[ arguments.length -1 ];
  dirname = iai.project.resolve.apply( dirname, slice(arguments, 0, -1) );
  fs.readdir( dirname, callback );
}
