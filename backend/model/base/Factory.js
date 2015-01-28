var f = require( 'util' ).format;

module.exports = Factory;

function Factory( engine, component ){
  var engine = engine || '';
  try {
    return require( f('./engine/%s%s', engine, component) );
  } catch( err ){
    if( err.code == 'MODULE_NOT_FOUND' ){
      throw new Error( f('%s%s not found', engine, component) );
    }
    err.message = f( 'require %s%s: %s', engine, component, err.message );
    throw err;
  }
}
