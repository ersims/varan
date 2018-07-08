// Dependencies
const getCompilationStats = require('../../../src/lib/getCompilationStats');

// Tests
describe('lib', () => {
  describe('getCompilationStats', () => {
    it('should support multiple webpack compilation stats', () => {
      const mockStats = [
        {
          startTime: 1531090470903,
          endTime: 1531090472903,
        },
        {
          startTime: 1531090471183,
          endTime: 1531090474688,
        },
      ];
      const buildStats = getCompilationStats(mockStats);
      expect(buildStats.timings.duration).toBe(3785);
      expect(buildStats.timings.minStart).toBe(1531090470903);
      expect(buildStats.timings.minEnd).toBe(1531090472903);
      expect(buildStats.timings.maxStart).toBe(1531090471183);
      expect(buildStats.timings.maxEnd).toBe(1531090474688);
      expect(buildStats.numberOfConfigs).toBe(2);
    });
    it('should support a single stat object', () => {
      const mockStats = {
        startTime: 1531090471182,
        endTime: 1531090474688,
      };
      const buildStats = getCompilationStats(mockStats);
      expect(buildStats.timings.duration).toBe(3506);
      expect(buildStats.timings.minStart).toBe(1531090471182);
      expect(buildStats.timings.minEnd).toBe(1531090474688);
      expect(buildStats.timings.maxStart).toBe(1531090471182);
      expect(buildStats.timings.maxEnd).toBe(1531090474688);
      expect(buildStats.numberOfConfigs).toBe(1);
    });
  });
});
