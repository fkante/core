import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import pluginReact from 'eslint-plugin-react'
import pluginReactCompiler from 'eslint-plugin-react-compiler'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/.nx/**',
      '**/node_modules/**',
      '**/build/**',
      '**/coverage/**',
      '**/public/**',
      '**/routeTree.gen.ts',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  {
    files: ['apps/frontend/**/*.{js,jsx,ts,tsx}'],
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: { ...globals.browser },
    },
    settings: { react: { version: 'detect' } },
  },
  {
    files: ['apps/frontend/**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'react-hooks': pluginReactHooks,
      'react-compiler': pluginReactCompiler,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      'react-compiler/react-compiler': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },

  {
    files: ['**/demo.*', '**/demo-*', '**/demo/**', '**/example-*', '**/example.*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      'react/jsx-key': 'off',
      'react/no-unescaped-entities': 'off',
      'react-compiler/react-compiler': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },

  prettier,
)
