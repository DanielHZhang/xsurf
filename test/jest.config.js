module.exports = {
  moduleNameMapper: {
    'src/(.*)': '<rootDir>/src/$1',
    'tests/(.*)': '<rootDir>/tests/$1',
  },
  preset: 'ts-jest',
  rootDir: process.cwd(),
  testEnvironment: 'node',
};
