// Type definitions for wait-on 3.0.1
// TypeScript Version: 3.0.3

declare module 'wait-on' {
  type WaitOn = (waitOptions: object, callback: (err: Error) => void) => void;
  const waitOn: WaitOn;
  export = waitOn;
}
