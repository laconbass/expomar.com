var iai = require('../../iai')
  , conf = iai.conf
;

var backend = iai( __dirname );

var mode = 'http';

conf.set( 'domain', 'expomar.loc' );

require( mode )
  .createServer( mode === 'https'? httpsOpts : undefined )
  .on( 'request', backend.require('app-main') )
  .listen( conf.port, conf.domain, function(){
    console.log( 'server listening @ %s://%s:%s', mode, conf.domain, conf.port )
  })
;
