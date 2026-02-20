/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: 'src/.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  setupFiles: ['<rootDir>/test/support/jest.setup.ts'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^generated/(.*)$': '<rootDir>/generated/$1',
    '^\\./enums\\.js$': '<rootDir>/generated/prisma/enums.ts',
    '^\\./internal/class\\.js$': '<rootDir>/generated/prisma/internal/class.ts',
    '^\\./internal/prismaNamespace\\.js$':
      '<rootDir>/generated/prisma/internal/prismaNamespace.ts',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};
