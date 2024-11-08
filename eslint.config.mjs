import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      "no-unused-vars": "off",  // Mematikan aturan no-unused-vars
    },
    ignores: [
      "node_modules/**",
      "dist/**",
    ],
  },
  pluginJs.configs.recommended,
];
