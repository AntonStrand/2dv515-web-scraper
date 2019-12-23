module.exports = {
    "env": {
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    rules: {
        "indent": ["error", 2, { "MemberExpression": 1, "ArrayExpression": 1, "CallExpression": {"arguments": 1}, "flatTernaryExpressions": true }],
        "linebreak-style": ["error", "unix"],
        quotes: ["error", "single"],
        semi: ["error", "never"],
        "comma-spacing": ["error", { before: false, after: true }],
        "func-call-spacing": ["error", "always", { allowNewlines: true }],
        "no-multi-spaces": ["error", { ignoreEOLComments: true }],
        "no-dupe-keys": "error",
        "no-multiple-empty-lines": ["error", { max: 1 }],
        "no-unexpected-multiline": ["off"],
        "no-labels": "error",
        "no-unused-vars": ["error", { "after-used": null }],
        "no-undef": ["error"],
        eqeqeq: ["error", "always", { null: "ignore" }],
        "arrow-body-style": ["warn", "as-needed"],
        "arrow-spacing": "error",
        "prefer-arrow-callback": [
          "error",
          { allowNamedFunctions: false, allowUnboundThis: false }
        ],
        "no-var": ["error"],
        "object-curly-spacing": ["error", "always"],
        "prefer-const": ["warn"],
        "prefer-template": ["error"],
        "comma-dangle": ["error", "never"],
        "function-paren-newline": ["error", "consistent"],
        "array-bracket-newline": ["error", "consistent"],
        "array-bracket-spacing": ["error", "always"],
        "array-element-newline": ["error", "consistent"],
      }
};