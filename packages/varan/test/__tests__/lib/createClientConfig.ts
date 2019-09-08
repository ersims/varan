// Mocks
const ClientDefinePluginMock = jest.fn();
jest.mock('webpack', () => ({
  ...jest.requireActual('webpack'),
  DefinePlugin: ClientDefinePluginMock,
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const createClientConfig = require('../../../webpack/client');

// Tests
beforeEach(() => {
  ClientDefinePluginMock.mockReset();
});
it('should automatically add `APP_` and `REACT_APP_` environment variables to `DefinePlugin`', () => {
  process.env.APP_AUTO_DEFINE_VAR = JSON.stringify('DEFINE-VAR-APP-AUTO-REPLACE');
  process.env.REACT_APP_AUTO_DEFINE_VAR = JSON.stringify('DEFINE-VAR-REACT-APP-AUTO-REPLACE');
  process.env.NOT_REPLACED = JSON.stringify('DEFINE-VAR-NOT-REPLACE');

  // Create the config
  createClientConfig();

  // Unmock
  delete process.env.APP_AUTO_DEFINE_VAR;
  delete process.env.REACT_APP_AUTO_DEFINE_VAR;
  delete process.env.NOT_REPLACED;

  // Assertions
  expect(ClientDefinePluginMock).toHaveBeenCalledWith(
    expect.objectContaining({
      'process.env.NODE_ENV': JSON.stringify('test'),
      'process.env.APP_AUTO_DEFINE_VAR': JSON.stringify('DEFINE-VAR-APP-AUTO-REPLACE'),
      'process.env.REACT_APP_AUTO_DEFINE_VAR': JSON.stringify('DEFINE-VAR-REACT-APP-AUTO-REPLACE'),
    }),
  );
  const args = ClientDefinePluginMock.mock.calls[0][0];
  expect(args).toHaveProperty(['process.env.NODE_ENV']);
  expect(args).not.toHaveProperty(['process.env.NOT_REPLACED']);
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
  expect(ClientDefinePluginMock).toHaveBeenCalledWith(
    expect.objectContaining({
      'process.env.NODE_ENV': JSON.stringify('test'),
      var1: JSON.stringify('value1'),
      'process.env.MY_VAR': JSON.stringify('long value 2'),
    }),
  );
});
