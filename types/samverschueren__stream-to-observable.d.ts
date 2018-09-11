// Type definitions for @samverschueren/stream-to-observable 0.3.0
// TypeScript Version: 3.0.3

declare module '@samverschueren/stream-to-observable' {
  import { Stream } from 'stream';
  import { Observable } from 'rxjs';
  export default function streamToObservable<T = any>(stream: Stream, options: {}): Observable<T>;
}
