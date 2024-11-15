import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  pluginJs.configs.recommended,

  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",  
      globals: {
        ...globals.node,  
        ...globals.jest,
        ...globals.browser,
        // require: "readonly",  
        // module: "readonly",   
      },
    },
    rules: {
      // "no-unused-vars": "off",  
      // "no-undef": "off",       
    },
    ignores: [
      "node_modules/**",
      "dist/**",
    ],
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
      // "no-unused-vars": "off",
      // "no-undef": "off",
    },
  },
];
