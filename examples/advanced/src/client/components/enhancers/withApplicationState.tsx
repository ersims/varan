import * as React from 'react';
import { connect } from 'react-redux';
import boundActions from '../../redux/boundActions';

/* tslint:disable-next-line variable-name */
export default () => <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  class WithApplicationState extends React.Component<P & actionCreators['applicationActions']> {
    public componentWillMount() {
      this.props.applicationActions.init();
    }
    public render() {
      return <WrappedComponent {...this.props} />;
    }
  }
  return connect(
    undefined,
    boundActions<any, any>('applicationActions'),
  )(WithApplicationState);
};
