module.exports = {
  testEnvironment: 'node',
  // setupFilesAfterEnv: ['<rootDir>/src/Infrastructures/database/postgres/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/_test/**',
    '!src/**/index.js',
  ],
};
