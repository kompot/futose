var path      = require('path');
var express   = require('express');
var React     = require('react');
var nodejsx   = require('node-jsx').install({extension: '.js'});
var component = require('./assets/js/react/app-client.js');
var app       = express();
//var markup    = React.renderComponentToString(component);
//var r = component({
//  activeRoute: '/user/123',
//  path: '/user/:userId',
//  name: 'user',
//  userId: '123'
//});
var r = component('/user/123');
var markup = React.renderComponentToString(r);

console.log(markup)

app.get('/', function(req, res){
//  console.log(component);
//  var trimmed = markup.substr(0, markup.length - 1)
//  var trimmed = markup.toString();
//  console.log('--------' + trimmed + '-----------');
  res.send('<!doctype html>\n' +
      '<head>' +
      '<title>react test</title>' +
      '<script src="/public/js/bundle.js" type="text/javascript"></script>' +
      '</head>' +
      '<body>' + markup + '</body>' +
      '</html>'
  );
//  res.send('Hello World');
});

app
  .use('/public', express.static(path.join(__dirname, 'public')))
  .listen(9001, function() {
    console.log('Listening on port 9001');
  });
