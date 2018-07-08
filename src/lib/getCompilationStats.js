// Dependencies
const castArray = require('lodash.castarray');

// Exports
module.exports = rawStats => {
  const stats = castArray(rawStats);
  const timings = stats.reduce(
    (acc, cur) => {
      acc.minEnd = !acc.minEnd ? cur.endTime : Math.min(acc.minEnd, cur.endTime);
      acc.maxEnd = Math.max(acc.maxEnd, cur.endTime);
      acc.minStart = !acc.minStart ? cur.startTime : Math.min(acc.minStart, cur.startTime);
      acc.maxStart = Math.max(acc.maxStart, cur.startTime);
      return acc;
    },
    {
      minEnd: 0,
      maxEnd: 0,
      minStart: 0,
      maxStart: 0,
      get duration() {
        return this.maxEnd - this.minStart;
      },
    },
  );
  return {
    timings,
    numberOfConfigs: stats.length,
  };
};
