export default {
  preset: 'ts-jest/presets/default-esm',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  modulePaths: ['src'],
  modulePathIgnorePatterns: ['src/demo'],
  roots: ['src'],
  testEnvironment: 'jsdom',
  reporters: ['jest-simple-dot-reporter'],
  testRegex: '(\\.(test|spec)).(ts|tsx)$',
};
