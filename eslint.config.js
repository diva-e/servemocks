import js from '@eslint/js'
import jsdoc from 'eslint-plugin-jsdoc'
import globals from 'globals'

export default [
  {
    ignores: ['examples/**', 'node_modules/**']
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    plugins: {
      jsdoc
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    rules: {
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'max-len': ['warn', 120],
      'semi': ['warn', 'never'],
      'comma-dangle': ['error', 'only-multiline'],
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_' 
      }],
      'no-console': 'error',
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-returns-description': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-jsdoc': ['error', {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true
        }
      }]
    }
  },
  {
    files: ['**/*.spec.js'],
    rules: {
      'no-console': 'off'
    }
  }
]
