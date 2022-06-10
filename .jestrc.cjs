/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
/* https://jestjs.io/docs/configuration */
module.exports = {
  clearMocks: true,
  // collectCoverage: true,
  // collectCoverageFrom: undefined,
  // coverageDirectory: "coverage",
  // coveragePathIgnorePatterns: [
  //   "/node_modules/"
  // ],
  coverageReporters: ["json-summary", "text"],
  errorOnDeprecated: true,
  extensionsToTreatAsEsm: [".ts"],
  // globalSetup: undefined,
  // globalTeardown: undefined,
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  // moduleFileExtensions: [
  //   "js",
  //   "jsx",
  //   "ts",
  //   "tsx",
  //   "json",
  //   "node"
  // ],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  preset: "ts-jest/presets/default-esm", // or other ESM presets
  testEnvironment: "node",
  testMatch: ["<rootDir>/lib/**/*.test.[tj]s?(x)"],
  // timers: "real"
};
