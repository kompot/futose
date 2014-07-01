/** @jsx React.DOM */
var React = require('react');
var Router = require('react-nested-router');
var Link = Router.Link;

module.exports = React.createClass({
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
