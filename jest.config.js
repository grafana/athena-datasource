// force timezone to UTC to allow tests to work regardless of local timezone
// generally used by snapshots, but can affect specific tests
process.env.TZ = 'UTC';

const originalConfig = require('./.config/jest.config');

module.exports = {
  // Jest configuration provided by Grafana scaffolding
  ...originalConfig,
  moduleNameMapper: {
    ...originalConfig.moduleNameMapper,
    // Mirror the `@/*` -> `./src/*` path alias defined in tsconfig.json
    '^@/tests/(.*)$': '<rootDir>/tests/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
