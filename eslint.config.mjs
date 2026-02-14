import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig([
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // Basic rules to ensure build passes while maintaining some quality
      "no-unused-vars": "warn",
    }
  }
]);

export default eslintConfig;
