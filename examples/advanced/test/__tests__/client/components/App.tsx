import * as React from 'react';
import App from '../../../../src/client/components/App';
import renderer from 'react-test-renderer';

// Tests
test('renders correctly', () => {
  const component = renderer.create(<App />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
