var conf = require('../conf/server');

module.exports = require( conf.mode )
  .createServer( conf.mode === 'https'? conf.httpsConf : undefined )
  .on( 'request', require('./app-main') )
;

if( require.main === module ){
  module.exports.listen( conf.port, function(){
    console.log( 'server listening @ %s://%s:%s', conf.mode, conf.domain, conf.port )
  })
}
