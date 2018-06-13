import * as React from 'react';
import HttpStatus from '../../components/HttpStatus';

class NotFound extends React.PureComponent {
  public render() {
    return (
      <HttpStatus code={404}>
        <header className="header header--main">
          <h1>404 = Not Found</h1>
          <small>Try again!</small>
        </header>
        <main role="main">
          <h1>Still not found..</h1>
        </main>
      </HttpStatus>
    );
  }
}

export default NotFound;
