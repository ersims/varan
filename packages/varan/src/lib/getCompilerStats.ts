import webpack from 'webpack';
import { castArray, get, maxBy, minBy } from 'lodash';

// Types
export interface CompilerStats {
  timings: {
    readonly minEnd: number;
    readonly maxEnd: number;
    readonly minStart: number;
    readonly maxStart: number;
    readonly duration: number;
    perCompiler: Array<{
      start: number;
      end: number;
      readonly duration: number;
    }>;
  };
  numberOfConfigs: number;
}

// Exports
export default function getCompilerStats(rawStats: webpack.Stats | webpack.Stats[]): CompilerStats {
  const stats: webpack.Stats[] = castArray(rawStats);
  const timings = stats.reduce<CompilerStats['timings']>(
    (acc, cur) => {
      const startTime = cur.startTime as any;
      const endTime = cur.endTime as any;
      acc.perCompiler.push({
        start: startTime,
        end: endTime,
        get duration() {
          return this.end - this.start;
        },
      });
      return acc;
    },
    {
      get minEnd() {
        return get(minBy(this.perCompiler, (c: CompilerStats['timings']['perCompiler'][0]) => c.end), 'end', 0);
      },
      get maxEnd() {
        return get(maxBy(this.perCompiler, (c: CompilerStats['timings']['perCompiler'][0]) => c.end), 'end', 0);
      },
      get minStart() {
        return get(minBy(this.perCompiler, (c: CompilerStats['timings']['perCompiler'][0]) => c.start), 'start', 0);
      },
      get maxStart() {
        return get(maxBy(this.perCompiler, (c: CompilerStats['timings']['perCompiler'][0]) => c.start), 'start', 0);
      },
      get duration() {
        return this.maxEnd - this.minStart;
      },
      perCompiler: [],
    },
  );
  return {
    timings,
    numberOfConfigs: stats.length,
  };
}
