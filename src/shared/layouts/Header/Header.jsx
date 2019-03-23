import React, { Component } from 'react';
import style from './Header.scss';
import { Link } from 'react-router-dom';
import cx from 'classnames';

class Header extends Component {
  constructor (props) {
    super(props);
  }

  render () {
    return (
      <header className={style.header}>
        <div className={cx('container', style.container)}>
          <div className={style.wrapper}>
            <div className={style.logoContainer}>
              <Link to="/">Time Tracking</Link>
            </div>
          </div>
          <nav>
            <ul>
              <li>
                <span>Exit</span>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    );
  }

}

export default Header;
