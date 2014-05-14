var f = require( 'util' ).format;

module.exports = Factory;

function Factory( engine, component ){
  var engine = engine || '';
  try {
    return require( f('../%s/%s%s', engine.toLowerCase(), engine, component) );
  } catch( err ){
    if( err.code == 'MODULE_NOT_FOUND' ){
      throw new Error( f('Database engine "%s" not found', engine) );
    }
    err.message = f( 'require %s %s: %s', engine, component, err.message );
    throw err;
  }
}
