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
      },
    },
    rules: {
      "no-unused-vars": "off",  
      "no-undef": "off",       
    },
    ignores: [
      "node_modules/**",
      "dist/**",
      "src/controllers/**",
    ],
  },
];
