/** @jsx React.DOM */
'use strict';
var React = require('react');
var Router = require('react-nested-router');
var Link = Router.Link;

module.exports = React.createClass({
  render: function() {
    return (
      <div className="container">
        <div className="top-navigation">
          <ul>
            <li><Link to="user" userId="123">Bob</Link></li>
            <li><Link to="user" userId="abc">Sally</Link></li>
          </ul>
        </div>
        <div className="main">
          {this.props.activeRoute}
        </div>
        <div className="aside">
          <ul>
            <li>
              <b>Фильтр по времени.</b><br />
              Есть слайдер. Слева дата первого коммента, справа последнего.
              Двигая границы, все что не попадает в границы становится серым.
              То есть можно быстро понять что добавилось нового в объемном обсуждении.
              По умолчанию комменты, которые уже видел (дата последнего захода на страницу) серые.
            </li>
            <li>
              <b>Фильтр по пользователю.</b><br />
              Выбирая чекбоксами (по умолчанию все включены) пользователей можно понять быстро найти комменты
              от нужных.
            </li>
          </ul>
        </div>
      </div>
    );
  }
});
