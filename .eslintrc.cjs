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
  env: { browser: true, jest: true, node: true },
  parser: "@typescript-eslint/parser",
  parserOptions: { project: ["./tsconfig.json"] },
  ignorePatterns: [...ignorePatterns, "*.js", "*.cjs", "*.mjs", "*.jsx"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/strict",
    "plugin:unicorn/recommended",
    "prettier",
  ],
  plugins: ["unicorn", "prettier", "unused-imports", "simple-import-sort"],
  settings: { react: { version: "detect" } },
  rules: {
    curly: "error",
    eqeqeq: "error",
    "arrow-body-style": "off",
    "no-array-constructor": "off",
    "no-console": ["warn", { allow: ["debug"] }],
    "no-duplicate-imports": "error",
    "no-unused-vars": "off",
    "no-unneeded-ternary": "error",
    "no-extra-boolean-cast": "error",
    "no-useless-concat": "error",
    "no-case-declarations": "error",
    "no-unsafe-optional-chaining": "error",
    "no-nested-ternary": "warn",
    "no-template-curly-in-string": "error",
    "no-warning-comments": "off",
    "object-shorthand": ["warn", "always", { avoidExplicitReturnArrows: false }],
    "prefer-const": "error",
    "use-isnan": "error",
    "no-var": "error",
    "max-classes-per-file": "error",
    "max-lines": ["warn", { max: 1000 }],
    "no-empty-pattern": "error",
    "array-callback-return": "warn",
    "spaced-comment": ["warn", "always", { markers: ["/"] }],
    "no-implicit-coercion": "warn",
    "no-negated-condition": "warn",
    "simple-import-sort/imports": "warn",
    "simple-import-sort/exports": "warn",
    "@typescript-eslint/ban-types": "error",
    "@typescript-eslint/no-empty-function": "error",
    "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-array-constructor": "error",
    "@typescript-eslint/no-extra-non-null-assertion": "error",
    "@typescript-eslint/no-inferrable-types": "error",
    "@typescript-eslint/array-type": ["warn", { default: "array-simple" }],
    "@typescript-eslint/non-nullable-type-assertion-style": "off",
    "@typescript-eslint/naming-convention": [
      "warn",
      {
        selector: "variable",
        types: ["boolean"],
        format: ["PascalCase", "UPPER_CASE"],
        /* prettier-ignore */
        prefix: ['is', 'are', 'should', 'has', 'can', 'did', 'will', 'IS_', 'ARE_', 'SHOULD_', 'HAS_', 'CAN_', 'DID_', 'WILL_'],
      },
    ],
    "@typescript-eslint/no-unnecessary-condition": "warn",
    "unicorn/prevent-abbreviations": [
      "error",
      {
        extendDefaultReplacements: false,
        replacements: {
          def: { defer: true, deferred: true, define: true, definition: true },
          dir: { direction: true, directory: true },
          docs: { documentation: true, documents: true },
          dst: { daylightSavingTime: true, destination: true, distribution: true },
          e: { error: true, event: true, end: true },
          rel: { related: true, relationship: true, relative: true },
          res: { response: true, result: true },
        },
        allowList: { e2e: true },
      },
    ],
    "unicorn/expiring-todo-comments": [
      "warn",
      { terms: ["todo", "to do"], allowWarningComments: false },
    ],
    "unicorn/filename-case": "off",
    "unicorn/no-null": "off",
    "unicorn/prefer-switch": ["error", { minimumCases: 5 }],
    "unicorn/no-new-array": "off",
    "unicorn/no-thenable": "off",
    "unicorn/no-await-expression-member": "off",
    "unicorn/error-message": "error",
    "unicorn/no-abusive-eslint-disable": "error",
    "unicorn/prefer-add-event-listener": "error",
    "unicorn/prefer-date-now": "error",
    "unicorn/prefer-includes": "error",
    "unicorn/prefer-math-trunc": "error",
    "unicorn/prefer-string-slice": "error",
    "unicorn/consistent-function-scoping": "error",
    "unicorn/no-array-for-each": "error",
    "unicorn/no-useless-undefined": "error",
    "unicorn/no-lonely-if": "error",
    "unicorn/no-zero-fractions": "error",
    "unicorn/no-array-push-push": "error",
    "unicorn/no-for-loop": "error",
    "unicorn/numeric-separators-style": "error",
    "unicorn/prefer-spread": "error",
    "unicorn/better-regex": "error",
    "unicorn/prefer-array-find": "error",
    "unicorn/catch-error-name": "error",
    "unicorn/prefer-export-from": "error",
    "unicorn/prefer-optional-catch-binding": "error",
    "unicorn/prefer-ternary": "error",
    "unicorn/prefer-number-properties": "error",
    "unicorn/explicit-length-check": "error",
    "unicorn/consistent-destructuring": "error",
    "unicorn/no-array-reduce": ["error", { allowSimpleOperations: false }],
    "unicorn/no-useless-spread": "warn",
    "unicorn/no-useless-fallback-in-spread": "warn",
    "unicorn/prefer-array-some": "error",
    "unicorn/prefer-code-point": "error",
    "unicorn/prefer-query-selector": "error",
    "unused-imports/no-unused-vars": [
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
    "unused-imports/no-unused-imports": "error",
  },
  overrides: [
    {
      files: ".scripts/**/*.ts",
      parserOptions: {
        project: ["./.scripts/tsconfig.json"],
      },
      rules: {
        "unicorn/prefer-module": "off",
        "@typescript-eslint/no-var-requires": "off",
        "no-console": "off",
      },
    },
    // ↓ allows for scoped rules, like scoping filename cases to certain directories
    // {
    //   "files": "pages/**/*.tsx",
    //   "rules": {
    //     "unicorn/filename-case": [
    //       "error",
    //       {
    //         "case": "kebabCase"
    //       }
    //     ]
    //   }
    // }
  ],
};
