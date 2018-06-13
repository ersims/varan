import * as React from 'react';
import { NavLink } from 'react-router-dom';

// Types
interface NavBarLinkProps {
  to: string;
  exact?: boolean;
  children: React.ReactNode;
}

class NavBarLink extends React.Component<NavBarLinkProps> {
  public static defaultProps: Partial<NavBarLinkProps> = {
    exact: true,
  };
  public render() {
    const { children, to, exact } = this.props;
    return (
      <NavLink className="navbar__link" exact={exact} to={to} activeClassName="is-active">
        {children}
      </NavLink>
    );
  }
}

export default NavBarLink;
