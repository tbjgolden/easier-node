/* https://jestjs.io/docs/configuration */
module.exports = {
  clearMocks: true,
  coverageReporters: ["json-summary", "text"],
  testEnvironment: "node",
  testMatch: ["<rootDir>/lib/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "./.scripts/sucrase-jest.cjs",
  },
  transformIgnorePatterns: ["/node_modules/(?!(normalize-url)/)"],
};
