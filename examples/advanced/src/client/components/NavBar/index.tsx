import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { RootState } from '../../redux';
import NavBarLink from './Link';
import AnimatedExpandable from '../AnimatedExpandable';

// Types
interface NavProps {
  location: string;
}
interface NavState {
  isOpen: boolean;
}
class Nav extends PureComponent<NavProps, NavState> {
  public state = {
    isOpen: false,
  };
  public toggleMenu = () => this.setState(state => ({ isOpen: !state.isOpen }));
  public closeMenu = () => this.setState({ isOpen: false });
  public componentWillReceiveProps(nextProps: NavProps) {
    if (nextProps.location !== this.props.location) this.closeMenu();
  }
  public render() {
    const { isOpen } = this.state;
    return (
      <nav className="navbar">
        <NavLink className="navbar__title" to="/">
          <h1 className="navbar__title-text">Varan</h1>
        </NavLink>
        <button
          className={classNames('navbar__hamburger', { 'navbar__hamburger--open': isOpen })}
          aria-label="Menu"
          aria-expanded={isOpen}
          aria-controls="navbar-menu"
          type="button"
          onClick={this.toggleMenu}
          onKeyPress={e => e.key === 'Enter' && this.toggleMenu()}
        >
          <span className={classNames('navbar__hamburger-line', { 'navbar__hamburger-line--open': isOpen })} />
          <span className={classNames('navbar__hamburger-line', { 'navbar__hamburger-line--open': isOpen })} />
          <span className={classNames('navbar__hamburger-line', { 'navbar__hamburger-line--open': isOpen })} />
        </button>
        <AnimatedExpandable isOpen={isOpen} className="navbar__list-container">
          <ul id="navbar-menu" className={classNames('navbar__list', { 'navbar__list--open': isOpen })}>
            <li className="navbar__item" role="presentation">
              <NavBarLink to="/examples">Examples</NavBarLink>
            </li>
            <li className="navbar__item" role="presentation">
              <NavBarLink to="/about">About</NavBarLink>
            </li>
          </ul>
        </AnimatedExpandable>
      </nav>
    );
  }
}

export default connect((state: RootState) => ({ location: state.router.location.pathname }))(Nav);
