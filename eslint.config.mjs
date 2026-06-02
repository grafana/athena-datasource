import { defineConfig, globalIgnores } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([
  globalIgnores(['**/node_modules', '**/build', '**/dist', '**/playwright-report/**']),
  {
    extends: compat.extends('plugin:jsx-a11y/recommended',  './.config/.eslintrc'),
  },
  {
    rules: {
      'deprecation/deprecation': 'off',
       'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./*', './**/*', '../*', '../**/*'],
              message: 'Relative imports are not allowed. Use @/ path aliases instead (e.g., @/components/..., @/utils/...).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-deprecated': 'warn',
    },
  },
  {
    files: ['jest-{setup,config}.js','test/**/*.spec.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]);
