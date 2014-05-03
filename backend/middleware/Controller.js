module.exports = Controller;

function Controller( meta, handle ){
  meta = meta || {};

  if( !meta.name || !meta.desc ){
    throw new Error( "all controllers must have #name and #desc" );
  }

  if( typeof handle !== 'function' ){
    throw new Error( "all controllers must have a handle function" );
  }

  handle.meta = meta;
  return handle;
}
