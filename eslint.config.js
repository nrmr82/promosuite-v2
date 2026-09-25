import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['build', 'node_modules', 'backend', 'backup*', '.wrangler'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...js.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // JSX usage isn't tracked without eslint-plugin-react, so only flag unused non-components
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]', args: 'none', ignoreRestSiblings: true }],
      'react-refresh/only-export-components': 'off',
      'preserve-caught-error': 'off',
    },
  },
  {
    files: ['**/*.test.{js,jsx}'],
    languageOptions: { globals: { ...globals.vitest } },
  },
];
