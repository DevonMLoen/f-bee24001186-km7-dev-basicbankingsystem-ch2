import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  pluginJs.configs.recommended,

  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
<<<<<<< Updated upstream
        ...globals.node,  
        ...globals.jest,
        ...globals.browser,
        // require: "readonly",  
        // module: "readonly",   
=======
        ...globals.node,
        ...globals.jest,
        ...globals.browser,
>>>>>>> Stashed changes
      },
    },
    env: {
      node: true, // Enable Node.js environment
      es2021: true, // Optional: Enable ES2021 features
    },
    extends: ["eslint:recommended"],
    rules: {
<<<<<<< Updated upstream
      "no-unused-vars": "off",  
      // "no-undef": "off",       
    },
    ignores: [
      "node_modules/**",
      "dist/**",
    ],
=======
      "no-unused-vars": "off",
      "no-undef": "off",
    },
    ignores: ["node_modules/**", "dist/**", "src/controllers/**"],
>>>>>>> Stashed changes
  },

  {
    files: ["src/controllers/**/*.js"],  
    languageOptions: {
      globals: {
        ...globals.node, 
        // require: "readonly",
        // module: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "off",
      // "no-undef": "off",
    },
  },
];
