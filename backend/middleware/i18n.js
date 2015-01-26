
module.exports = i18n;

var langNames = {
  gl: 'Galego',
  es: 'Castellano',
  en: 'English'
};

/**
 * Middleware relative to multi-language support
 * @param `translate` [function( lang, string )]: 't' function
 * @param `main` [string]: main language code
 * @param `available` [array]: selectable language codes
 */

function i18n( main, available, translate ){
  // TODO main atribute should be removed in favor of available[0]
  if( !Array.isArray(available) ){
    throw Error('you must provide available languages as array')
  }
  var langs = {};
  available.forEach(function( code ){ langs[code] = langNames[code]; });

  // TODO why the hell i wrote this instead doing a simple join?
  available = available.reduce(function( prev, curr ){ return prev + '|' + curr }, main)
  available = new RegExp( '^('+available+')\..*', 'i' )

  translate = translate || t;
  if( typeof translate != 'function' ){
    throw Error('you must provide a translate function');
  }

  return function i18n( req, res, next ){
    var match = available.exec( req.headers.host );
    res.locals.lang = req.language = (match)? match[1] : main;
    res.locals.i18n = { available: langs, main: main, mainName: langNames[main] };
    res.locals.t = translate.bind( translate, req.language );
    next();
  }
}

/**
 * default implementation of the translate function
 */

function t( lang, string, values ){
  return string;
}
