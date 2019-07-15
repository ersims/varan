// Type definitions for detect-port-alt 1.1.6
// TypeScript Version: 3.0.3

declare module 'detect-port-alt' {
  type DetectPort = (port: number, host: string) => Promise<number>;
  const detectPort: DetectPort;
  export = detectPort;
}
