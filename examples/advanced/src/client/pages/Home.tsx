import * as React from 'react';
import Helmet from 'react-helmet';

class Home extends React.PureComponent {
  public render() {
    return (
      <>
        <Helmet>
          <title itemProp="name" lang="en">
            Home of varan
          </title>
        </Helmet>
        <header className="header header--main">
          <h1>Varan advanced react example with typescript</h1>
          <small  className="header--small">It's awesome!</small>
        </header>
        <main role="main">
          <h1>Home</h1>
        </main>
      </>
    );
  }
}

export default Home;
