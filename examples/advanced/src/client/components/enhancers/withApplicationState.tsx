import * as React from 'react';
import { connect } from 'react-redux';
import boundActions from '../../redux/boundActions';
import { actionCreators } from '../../redux';

export default () => <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  class WithApplicationState extends React.Component<P & Pick<typeof actionCreators, 'applicationActions'>> {
    public componentDidMount() {
      this.props.applicationActions.init();
    }
    public render() {
      return <WrappedComponent {...this.props} />;
    }
  }
  return connect(
    null,
    boundActions<any, any>('applicationActions'),
  )(WithApplicationState);
};
