const base = require('./packages/global-packages/packages/dev-tools/js/eslint/config');
const ignorePatterns = require('./packages/global-packages/packages/dev-tools/js/eslint/ignore');

module.exports = {
	...base,
	ignorePatterns: [
		...ignorePatterns,
		// Pro-only paths (were in root .eslintignore).
		'/packages/freemius-sdk/*',
		'packages/console/*',
		'wordpress*',
	],
	rules: {
		...base.rules,
		'@wordpress/i18n-text-domain': [
			'error',
			{
				allowedTextDomain: ['blockera', 'blockera-pro'],
			},
		],
	},
};
