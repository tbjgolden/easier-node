/* https://jestjs.io/docs/configuration */
module.exports = {
  clearMocks: true,
  coverageReporters: ["json-summary", "text"],
  testEnvironment: "node",
  testMatch: ["<rootDir>/lib/**/*.test.[tj]s?(x)"],
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc-node/jest"],
  },
  transformIgnorePatterns: ["/node_modules/(?!(normalize-url)/)"],
};
