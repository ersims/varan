// Dependencies
import * as React from 'react';
import { Route } from 'react-router';

// Types
interface HttpStatusProps {
  code: number;
  children: React.ReactNode;
}

class HttpStatus extends React.Component<HttpStatusProps> {
  public render() {
    const { children, code } = this.props;
    return (
      <Route
        render={({ staticContext }) => {
          if (staticContext && code) staticContext.statusCode = code;
          return children;
        }}
      />
    );
  }
}

export default HttpStatus;
