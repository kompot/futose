/** @jsx React.DOM */
'use strict';

var React = require('react');

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
