// backend/tests/jest.config.js
module.exports = {
  testEnvironment: 'node',
  rootDir: '../',
  testMatch: ['**/tests/**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/models/index.js',
  ],
  coverageThreshold: {
    global: {
      lines:      70,
      functions:  70,
      branches:   60,
      statements: 70,
    },
  },
  setupFiles: ['<rootDir>/tests/setup.js'],
};
