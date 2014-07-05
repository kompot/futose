var path      = require('path');
var express   = require('express');
var React     = require('react');
var nodejsx   = require('node-jsx').install({extension: '.js'});
var component = require('./../app.js');

var app = express();
app.use(express.static(path.join(__dirname, '..', '..')));

console.log('__dirname', __dirname);
console.log('__dirname', path.join(__dirname, '..', '..'));

// TODO right now we always render root server component
// as soon as this issue
// https://github.com/rpflorence/react-nested-router/issues/57
// is fixed it will be possible to
// render components on server and reuse them on client
var markup = React.renderComponentToString(component());
app.get('/', function (req, res) {
  res.send('<!doctype html>\n' +
      '<head>' +
      '<title>react 2 test</title>' +
      '<script src="/js/app.js" type="text/javascript"></script>' +
      '<link rel="stylesheet" href="/css/screen.css"></link>' +
      '</head>' +
      '<body>' + markup + '</body>' +
      '</html>'
  );
});

app
//  .use('../../dev', express.static(path.join(__dirname, '..', '..', 'dev')))
  .listen(9001, function() {
    console.log('Listening on port 9001');
  });
