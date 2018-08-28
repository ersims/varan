// Dependencies
const castArray = require('lodash.castarray');

// Exports
module.exports = rawStats => {
  const stats = castArray(rawStats);
  const timings = stats.reduce(
    (acc, cur) => {
      acc.perCompiler.push({
        start: cur.startTime,
        end: cur.endTime,
        get duration() {
          return this.end - this.start;
        },
      });
      acc.total.minEnd = !acc.total.minEnd ? cur.endTime : Math.min(acc.total.minEnd, cur.endTime);
      acc.total.maxEnd = Math.max(acc.total.maxEnd, cur.endTime);
      acc.total.minStart = !acc.total.minStart ? cur.startTime : Math.min(acc.total.minStart, cur.startTime);
      acc.total.maxStart = Math.max(acc.total.maxStart, cur.startTime);
      return acc;
    },
    {
      total: {
        minEnd: 0,
        maxEnd: 0,
        minStart: 0,
        maxStart: 0,
        get duration() {
          return this.maxEnd - this.minStart;
        },
      },
      perCompiler: [],
    },
  );
  return {
    timings,
    numberOfConfigs: stats.length,
  };
};
