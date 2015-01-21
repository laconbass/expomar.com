var Manager = require('../base/Manager')
  , resolve = require('path').resolve
  , FeiraSchema = require( './FeiraSchema' );
;

var dirname = process.env.NODE_ENV === 'test'? 'data' : 'data-test';

var exports = module.exports = Manager.extend({
  uses: {
    engine: 'FileSystem',
    dirname: resolve( process.cwd(), dirname, FeiraSchema._type )
  },
  schema: FeiraSchema
})


