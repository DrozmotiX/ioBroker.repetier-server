// ESLint flat configuration (ESLint >= 9)
import js from '@eslint/js';
import globals from 'globals';

export default [
	{
		// Build output and generated/vendored files are never linted
		ignores: ['admin/build/**', 'admin/src/**', 'node_modules/**', '.prettierrc.js'],
	},
	js.configs.recommended,
	{
		files: ['**/*.js', '**/*.jsx'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'commonjs',
			globals: {
				...globals.node,
				...globals.mocha,
			},
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		rules: {
			'no-console': 'off',
			'no-unused-vars': [
				'error',
				{
					ignoreRestSiblings: true,
					argsIgnorePattern: '^_',
				},
			],
			'no-var': 'error',
			'prefer-const': 'error',
		},
	},
];
