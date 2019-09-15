// Type definitions for imagemin-mozjpeg 8.0.0
// TypeScript Version: 3.6.3

declare module 'imagemin-mozjpeg' {
  export default function imageminMozjpeg(options?: { quality: number; progressive: boolean }): Promise<Buffer>;
}
