/** @jsx React.DOM */
var React = require('react');
var Router = require('react-nested-router');
var Route = Router.Route;
var Link = Router.Link;

var App = React.createClass({
  render: function() {
    return (
      <div>
        <ul>
          <li><Link to="user" userId="123">Bob</Link></li>
          <li><Link to="user" userId="abc">Sally</Link></li>
        </ul>
        {this.props.activeRoute}
      </div>
      );
  }
});

var User = React.createClass({
  render: function() {
    return (
      <div className="User">
        <h1>User id: {this.props.params.userId}</h1>
        <ul>
          <li><Link to="task" userId={this.props.params.userId} taskId="foo">foo task</Link></li>
          <li><Link to="task" userId={this.props.params.userId} taskId="bar">bar task</Link></li>
        </ul>
        {this.props.activeRoute}
      </div>
      );
  }
});

var Task = React.createClass({
  render: function() {
    return (
      <div className="Task">
        <h2>User id: {this.props.params.userId}</h2>
        <h3>Task id: {this.props.params.taskId}</h3>
      </div>
      );
  }
});

var routes = (
  <Route handler={App} location="history">
    <Route name="user" path="/user/:userId" handler={User}>
      <Route name="task" path="/user/:userId/tasks/:taskId" handler={Task}/>
    </Route>
  </Route>
  );

module.exports = routes;
