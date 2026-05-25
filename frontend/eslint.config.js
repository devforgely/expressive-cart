// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { 
    // Ignore build folders
    ignores: ['dist', 'node_modules'] 
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    // 1. Register the plugins
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    // 2. Apply the rules
    rules: {
      ...js.configs.recommended.rules,
      
      // Core React rules
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules, // Handles modern React 17+ JSX transform

      // Hooks rules
      ...reactHooks.configs.recommended.rules,

      // Vite Fast Refresh rules
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
    // 3. Tell the React plugin which version you are using
    settings: {
      react: {
        version: 'detect', // Automatically detects your React version
      },
    },
  },
]