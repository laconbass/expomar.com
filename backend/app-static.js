var iai = require('../../iai')
  , project = iai.project
  , express = require('express')
  , app = express.Router()
  , less = require('less-middleware')
;

module.exports = app;

app
  .use( less( project.resolve( 'styles' ), {
      // options
      force: ! iai.production,
      debug: ! iai.production,
      dest: project.resolve( 'static' ),
      preprocess: {
        path: function( path, req ){
          return path.replace( '/css', '' );
        }
      }
    }, {
      // parser options
      //dumpLineNumbers: 'all',
      paths: [ project.resolve('static/css/lib') ],
      optimization: iai.production? 2 : 0
    }, {
      // compiler options
      compress: iai.production? true : 'auto',
      yuicompress: iai.production
    }
  ) )
  .use( express.static( project.resolve('static'), {
      maxAge: 1000 * 60 * 60 * 24
  }) )
;
