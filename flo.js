var flo = require('fb-flo'),
    path = require('path'),
    fs = require('fs');

var server = flo( 'assets/', {
  port: 8888,
  host: '127.0.0.1',
//  verbose: true,
  glob: [ '**/*.js', '**/*.styl' ]
}, function resolver(filepath, callback) {

      console.log("----------------- fb-flo detected changes ");
      console.log(filepath);
      console.log(callback);
      console.log("-----------------");

      if (filepath.indexOf('styl') != -1) {
        callback({
//        match: 'equal',
          resourceURL: 'screen.css',
          contents: fs.readFileSync('public/css/screen.css'),
          reload: false
        });
      }
      if (filepath.indexOf('js') != -1) {
        callback({
          resourceURL: 'index.js',
          contents: fs.readFileSync('public/js/index.js'),
          reload: false
        });
      }
    }
);

server.once('ready', function() {
  console.log('Ready!');
});
