var path      = require('path');
var express   = require('express');
var React     = require('react');
var nodejsx   = require('node-jsx').install({extension: '.js'});
var component = require('./assets/js/react/app.js');
var app       = express();

// TODO right now we always render root server component
// as soon as this issue
// https://github.com/rpflorence/react-nested-router/issues/57
// is fixed it will be possible to
// render components on server and reuse them on client
var markup = React.renderComponentToString(component());
app.get('/', function(req, res){
  res.send('<!doctype html>\n' +
      '<head>' +
      '<title>react test</title>' +
      '<script src="/public/js/bundle.js" type="text/javascript"></script>' +
      '</head>' +
      '<body>' + markup + '</body>' +
      '</html>'
  );
});

app
  .use('/public', express.static(path.join(__dirname, 'public')))
  .listen(9001, function() {
    console.log('Listening on port 9001');
  });
