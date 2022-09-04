module.exports = {
  root: true,
  env: {
    es6: true
  },
  extends: [''],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'jest', 'import'],
  settings: {
    'import/external-module-folders': ['node_modules', 'web'],
    'import/resolver': {
      // NOTE: sk - These aliases are required for the import/order rule.
      alias: {
        map: [
          ['app', './src'],
          ['utils', '@coliving/web/src/utils'],
          ['common', '@coliving/web/src/common']
        ],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
      }
    }
  },
  rules: {
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        disallowTypeAnnotations: false
      }
    ]
  }
}
