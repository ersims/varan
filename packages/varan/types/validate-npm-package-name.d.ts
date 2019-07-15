// Type definitions for validate-npm-package-name 3.0.0
// TypeScript Version: 3.0.3

declare module 'validate-npm-package-name' {
  export default function validateNPMPackageName(
    name: string,
  ): {
    validForNewPackages: boolean;
    validForOldPackages: boolean;
    errors: string[];
    warnings: string[];
  };
}
