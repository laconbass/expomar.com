var express = require('express')
  , resolve = require('path').resolve.bind( 0, process.cwd() )
  , app = express.Router()
  , less = require('less-middleware')
  , production = process.env.NODE_ENV === 'production'
;

module.exports = app;

app
  .use( less( resolve( 'styles' ), {
      // options
      force: ! production,
      debug: ! production,
      dest: resolve( 'static' ),
      preprocess: {
        path: function( path, req ){
          return path.replace( '/css', '' );
        }
      }
    }, {
      // parser options
      //dumpLineNumbers: 'all',
      paths: [ resolve('static/css/lib') ],
      optimization: production? 2 : 0
    }, {
      // compiler options
      compress: production? true : 'auto',
      yuicompress: production
    }
  ) )
  .use( express.static( resolve('static'), {
      maxAge: 1000 * 60 * 60 * 24
  }) )
;
