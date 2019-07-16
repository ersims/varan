// Init
jest.doMock('core-js/package.json', () => undefined);

// Tests
it('should require core-js peer dependency', async done => {
  // Assertions
  await expect(import('../../src')).rejects.toThrow('Peer dependency "core-js" or "core-js-pure" is required!');

  // Done
  done();
});
