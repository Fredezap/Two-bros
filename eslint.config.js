// Archivo: eslint.config.js

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Reglas globales de ignorar (node_modules, build output)
  globalIgnores(['dist', 'node_modules']),
  
  {
    files: ['**/*.{js,jsx}'],
    
    // Extiende las configuraciones recomendadas
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended, // Reglas de Hooks (esenciales)
      reactRefresh.configs.vite, // Reglas para Vite/HMR
    ],
    
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    
    rules: {
      // 1. FORMATO: Identación de 2 espacios
      'indent': ['error', 2, { SwitchCase: 1 }],
      
      // 2. PUNTO Y COMA: Prohíbe el uso de punto y coma
      'semi': ['error', 'never'],
      
      // 3. VARIABLES NO USADAS: Cambia de error a advertencia (warn)
      // Permite tener variables (como useMemo) sin usar durante el desarrollo.
      'no-unused-vars': ['warn', { 
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],
      
      // 4. PREFERENCIAS DE CÓDIGO (Reglas opcionales pero útiles)
      'quotes': ['error', 'single'], // Forzar comillas simples

      // Reglas obligatorias para React (se mantienen para evitar bugs)
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn', // Cambia a 'warn' para ser menos estricto
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // conservar reglas de hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
])