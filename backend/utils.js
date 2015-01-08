var f = require('util').format;
var conf = require('../conf/server.js');

module.exports = {
  // taken from http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
  // no edits made
  romanize: function romanize (num) {
    if (!+num)
      return false;
    var	digits = String(+num).split(""),
      key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
             "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
             "","I","II","III","IV","V","VI","VII","VIII","IX"],
      roman = "",
      i = 3;
    while (i--)
      roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
  },
  url: function url( subdomain, path ){
    return f(
      'http://%s%s%s', subdomain? (subdomain+'.') : '',
      conf.production? conf.domain : ( conf.domain+':'+conf.port ),
      path? ( path[0] == '/'? path : ('/'+path) ) : ''
    );
  }
}
