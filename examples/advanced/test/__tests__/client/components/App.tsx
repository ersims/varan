import * as React from 'react';
import App from '../../../../src/client/components/App';
import { shallow } from 'enzyme';

// Tests
test('renders correctly', () => {
  expect(shallow(<App />)).toMatchSnapshot();
});
