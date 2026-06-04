import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintPluginSvelte from 'eslint-plugin-svelte';
import prettierConfig from 'eslint-config-prettier';
import svelteParser from 'svelte-eslint-parser';
import astroParser from 'astro-eslint-parser';
import globals from 'globals';

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	...eslintPluginAstro.configs.recommended,
	...eslintPluginSvelte.configs['flat/recommended'],
	prettierConfig,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tseslint.parser,
				extraFileExtensions: ['.svelte'],
			},
		},
		rules: {
			'svelte/no-at-html-tags': 'warn',
			'svelte/require-each-key': 'warn',
		},
	},
	{
		files: ['**/*.astro'],
		languageOptions: {
			parser: astroParser,
			parserOptions: {
				parser: tseslint.parser,
				extraFileExtensions: ['.astro'],
			},
		},
	},
	{
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-unused-expressions': 'off',
		},
	},
	{
		ignores: ['.astro/', 'dist/', 'node_modules/'],
	},
);
