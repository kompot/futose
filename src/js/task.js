/** @jsx React.DOM */
var React = require('react');
var Router = require('react-nested-router');
var Link = Router.Link;

module.exports = React.createClass({
  render: function() {
    return (
      <div className="Task">
        <h2>User id: {this.props.params.userId}</h2>
        <h3>Task id: {this.props.params.taskId}</h3>
      </div>
      );
  }
});
