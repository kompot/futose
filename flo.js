var flo = require('fb-flo'),
    path = require('path'),
    fs = require('fs');

var server = flo('public/', {
  port: 8888,
  host: '127.0.0.1',
//  verbose: true,
  glob: [ '**/*.js', '**/*.css' ]
}, function resolver(filepath, callback) {

      console.log("----------------- fb-flo detected changes ");
      console.log(filepath);
      console.log(callback);
      console.log("-----------------");

      if (filepath.indexOf('css') != -1) {
        callback({
//        match: 'equal',
          resourceURL: 'screen.css',
          contents: fs.readFileSync('public/css/screen.css'),
          reload: false
        });
      }
      if (filepath.indexOf('js') != -1) {
        callback({
          resourceURL: 'bundle.js',
          contents: fs.readFileSync('public/js/bundle.js'),
          reload: false
        });
      }
    }
);

server.once('ready', function() {
  console.log('Ready!');
});
