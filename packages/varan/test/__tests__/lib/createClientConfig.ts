import { DefinePlugin } from 'webpack';
import createClientConfig from '../../../src/webpack/createClientConfig';

// Init
const ClientDefinePluginMock = DefinePlugin as jest.Mock;

// Mocks
jest.mock('webpack', () => ({
  ...jest.requireActual('webpack'),
  DefinePlugin: jest.fn(),
}));

// Tests
beforeEach(() => {
  ClientDefinePluginMock.mockReset();
});
it('should automatically add `APP_BUILD_VAR_` and `REACT_APP_` environment variables to `DefinePlugin`', () => {
  process.env.APP_NOT_AUTO_DEFINE_VAR = 'DEFINE-VAR-APP-NOT-AUTO-REPLACE';
  process.env.APP_BUILD_VAR_AUTO_DEFINE_VAR = 'DEFINE-VAR-APP-BUILD-VAR-AUTO-REPLACE';
  process.env.REACT_APP_AUTO_DEFINE_VAR = 'DEFINE-VAR-REACT-APP-AUTO-REPLACE';
  process.env.NOT_REPLACED = 'DEFINE-VAR-NOT-REPLACE';

  // Create the config
  createClientConfig();

  // Unmock
  delete process.env.APP_AUTO_DEFINE_VAR;
  delete process.env.APP_BUILD_VAR_AUTO_DEFINE_VAR;
  delete process.env.REACT_APP_AUTO_DEFINE_VAR;
  delete process.env.NOT_REPLACED;

  // Assertions
  expect(DefinePlugin).toHaveBeenCalledWith(
    expect.objectContaining({
      'process.env.NODE_ENV': JSON.stringify('test'),
      'process.env.APP_BUILD_VAR_AUTO_DEFINE_VAR': JSON.stringify('DEFINE-VAR-APP-BUILD-VAR-AUTO-REPLACE'),
      'process.env.REACT_APP_AUTO_DEFINE_VAR': JSON.stringify('DEFINE-VAR-REACT-APP-AUTO-REPLACE'),
    }),
  );
  const args = ClientDefinePluginMock.mock.calls[0][0];
  expect(args).toHaveProperty(['process.env.NODE_ENV']);
  expect(args).not.toHaveProperty(['process.env.NOT_REPLACED']);
  expect(args).not.toHaveProperty(['process.env.APP_NOT_AUTO_DEFINE_VAR']);
});
it('should respect the `buildVars` property', () => {
  // Create the config
  createClientConfig({
    buildVars: {
      var1: JSON.stringify('value1'),
      'process.env.MY_VAR': JSON.stringify('long value 2'),
    },
  });

  // Assertions
  expect(DefinePlugin).toHaveBeenCalledWith(
    expect.objectContaining({
      'process.env.NODE_ENV': JSON.stringify('test'),
      var1: JSON.stringify('value1'),
      'process.env.MY_VAR': JSON.stringify('long value 2'),
    }),
  );
});
