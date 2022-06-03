const fs = require("fs");
const path = require("path");

// Use gitignore as eslintignore (single source of truth)
const ignorePatterns = fs
  .readFileSync(path.join(__dirname, ".gitignore"), "utf8")
  .split("\n")
  .map((line) => {
    return line.split("#")[0].trim();
  })
  .filter((withoutComment) => {
    return withoutComment.length > 0;
  });

module.exports = {
  env: {
    browser: true,
    jest: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:unicorn/recommended",
    "prettier",
  ],
  plugins: ["@typescript-eslint", "unicorn", "prettier"],
  ignorePatterns,
  rules: {
    "arrow-body-style": ["warn", "always"],
    "no-array-constructor": "off",
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        vars: "all",
        args: "after-used",
        ignoreRestSiblings: false,
        varsIgnorePattern: "^_",
        argsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^(_|error$)",
      },
    ],
    "@typescript-eslint/no-array-constructor": ["error"],
    "@typescript-eslint/no-explicit-any": ["warn"],
    "unicorn/filename-case": [
      "error",
      {
        cases: {
          kebabCase: true,
        },
      },
    ],
    "unicorn/no-null": "off",
    "unicorn/prevent-abbreviations": ["error"],
    "unicorn/prefer-switch": ["error", { minimumCases: 5 }],
    "unicorn/no-new-array": "off",
    "unicorn/no-nested-await": "off",
    "unicorn/no-await-expression-member": "off",
  },
  overrides: [
    {
      files: ["*.cjs"],
      rules: {
        "unicorn/prefer-module": "off",
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
};
