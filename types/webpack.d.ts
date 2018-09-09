// Type definitions for webpack 4.17.2
// TypeScript Version: 3.0.3

import webpack from 'webpack';
declare module 'webpack' {
  interface MultiCompiler {
    inputFileSystem?: webpack.Compiler['inputFileSystem'];
    outputFileSystem?: webpack.Compiler['outputFileSystem'];
  }
  interface Compiler {
    outputPath: string;
  }
}
