/** @jsx React.DOM */
var React = require('react');
var Router = require('react-nested-router');
var Layout = require('./layout');
var User = require('./user');
var Task = require('./task');
var Route = Router.Route;
var Link = Router.Link;

var App1 = React.createClass({
  render: function() {
    return routes;
  }
});

var routes = (
  <Route handler={Layout}>
    <Route name="user" path="/user/:userId" handler={User}>
      <Route name="task" path="/user/:userId/tasks/:taskId" handler={Task}/>
    </Route>
  </Route>
  );

if (typeof window !== 'undefined') {
  window.onload = function() {
//    React.renderComponent(App1(), document.body);
    React.renderComponent(routes, document.body);
  }
} else {
//  module.exports = routes;
//  module.exports = App1;
}
module.exports = App1;

