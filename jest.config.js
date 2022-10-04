module.exports = {
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': ['ts-jest'],
  },
  modulePaths: ['src'],
  modulePathIgnorePatterns: ['src/demo'],
  roots: ['src'],
  testEnvironment: 'jsdom',
  reporters: ['jest-simple-dot-reporter'],
  testRegex: '(\\.(test|spec)).(ts|tsx)$',
};
