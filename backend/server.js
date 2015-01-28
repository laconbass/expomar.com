var iai = require('../../iai')
  , conf = iai.conf
;

var backend = iai( __dirname );

var mode = 'http';

conf
  .set( 'domain', iai.production? 'expomar.com' : 'expomar.loc' )
  .set( 'port', 61337 )
;

require( mode )
  .createServer( mode === 'https'? httpsOpts : undefined )
  .on( 'request', backend.require('app-main') )
  .listen( conf.port, function(){
    console.log( 'server listening @ %s://%s:%s', mode, conf.domain, conf.port )
  })
;
