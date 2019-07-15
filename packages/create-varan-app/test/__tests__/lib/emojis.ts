import emojis from '../../../src/lib/emojis';

// Tests
it('exports the correct emojis', () => {
  const expectedEmojis = {
    success: '✔',
    warning: '⚠',
    failure: '❌',
    rocket: '🚀',
    robot: '🤖',
  };

  // Assertions
  expect(emojis).toEqual(expectedEmojis);
});
