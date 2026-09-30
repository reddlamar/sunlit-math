const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  { ignores: ['node_modules/', 'dist/', '.expo/', 'coverage/', 'store-assets/', 'docs/'] },
  { files: ['**/*.test.{ts,tsx}', '__mocks__/**', 'jest.setup.js'], languageOptions: { globals: { jest: 'readonly' } } },
];
