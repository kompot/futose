/** @jsx React.DOM */
'use strict';

var React = require('react');
var Router = require('react-nested-router');
var Link = Router.Link;

module.exports = React.createClass({
  render: function() {
    return (
      <div className="User">
        <h1><div className="number1"></div>User id: {this.props.params.userId}</h1>
        <ul>
          <li><Link to="task" userId={this.props.params.userId} taskId="foo">foo task</Link></li>
          <li><Link to="task" userId={this.props.params.userId} taskId="bar">bar task</Link></li>
        </ul>
        {this.props.activeRoute}
      </div>
      );
  }
});
