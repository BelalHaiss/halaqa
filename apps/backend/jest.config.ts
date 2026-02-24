import { pathsToModuleNameMapper } from 'ts-jest';
import type { Config } from 'jest';
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
import { compilerOptions } from './tsconfig.json';

import { createDefaultPreset } from 'ts-jest';
const tsJestTransformCfg = createDefaultPreset().transform;
const jestConfig: Config = {
  testEnvironment: 'node',
  transform: {
    ...tsJestTransformCfg,
  },
  // modulePaths: [compilerOptions.baseUrl], // <-- This will be set to 'baseUrl' value

  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
};

export default jestConfig;
