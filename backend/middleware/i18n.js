
module.exports = i18n;

/**
 * Middleware relative to multi-language support
 * @param `translate` [function( lang, string )]: 't' function
 * @param `main` [string]: main language code
 * @param `available` [array]: selectable language codes
 */

function i18n( main, available, translate ){
  if( !Array.isArray(available) ){
    throw Error('you must provide available languages as array')
  }
  available = available.reduce(function( prev, curr ){ return prev + '|' + curr }, main)
  available = new RegExp( '^('+available+')\..*', 'i' )

  translate = translate || t;
  if( typeof translate != 'function' ){
    throw Error('you must provide a translate function');
  }

  return function i18n( req, res, next ){
    var match = available.exec( req.headers.host );
    res.locals.lang = req.language = (match)? match[1] : main;
    res.locals.t = translate.bind( translate, req.language );

    // warn about available languages meeting request requeriments
    if( res.message && ! req.acceptsLanguage(req.language) ){
      var options = req.acceptedLanguages, match;
      while( options.length ){
        if( match = available.exec( options.shift() ) ){
          res.message( translate( match[1], 'lang available: ' + match[1] ) );
          options.length = 0;
        }
      }
    }
    next();
  }
}

/**
 * default implementation of the translate function
 */

function t( lang, string ){
  return string;
}
