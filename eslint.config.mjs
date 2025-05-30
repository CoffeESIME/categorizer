import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "./node_modules/ts-standard/eslintrc.json",
    "prettier"
  ),
  {
    parserOptions: {
      project: "tsconfig.json",
      tsconfigRootDir: "./",
      sourceType: "module",
    },
    rules: {
      "react/jsx-filename-extension": [
        1,
        {
          extensions: [".ts", ".tsx", ".js", ".jsx"],
        },
      ],
      "no-use-before-define": [
        "error",
        {
          variables: false,
        },
      ],
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/prop-types": "off",
      "react/prefer-stateless-function": "error",
      "react/button-has-type": "error",
      "react/jsx-pascal-case": "error",
      "react/jsx-no-script-url": "error",
      "react/no-children-prop": "error",
      "react/no-danger": "error",
      "react/no-danger-with-children": "error",
      "react/no-unstable-nested-components": [
        "error",
        {
          allowAsProps: true,
        },
      ],
      "react/jsx-fragments": "error",
      "react/destructuring-assignment": [
        "error",
        "always",
        {
          destructureInSignature: "always",
        },
      ],
      "react/jsx-no-leaked-render": [
        "error",
        {
          validStrategies: ["ternary"],
        },
      ],
      "react/jsx-max-depth": [
        "error",
        {
          max: 5,
        },
      ],
      "react/function-component-definition": [
        "warn",
        {
          namedComponents: "arrow-function",
        },
      ],
      "react/jsx-key": [
        "error",
        {
          checkFragmentShorthand: true,
          checkKeyMustBeforeSpread: true,
          warnOnDuplicates: true,
        },
      ],
      "react/jsx-no-useless-fragment": "warn",
      "react/jsx-curly-brace-presence": "warn",
      "react/no-typos": "warn",
      "react/display-name": "warn",
      "react/self-closing-comp": "warn",
      "react/jsx-one-expression-per-line": "off",
      "react/props-types": "off",
      "@typescript-eslint/restrict-template-expressions": "warn",
      "@typescript-eslint/no-unused-vars": "off",
      "react/jsx-sort-props": "off",
      "react/no-unused-prop-types": "off",
    },
  },
];
