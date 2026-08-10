const postcssScss = require('postcss-scss');
const wpConfig = require('@wordpress/stylelint-config');

module.exports = {
	...wpConfig,
	plugins: [...(wpConfig.plugins || []), 'stylelint-scss'],
	rules: {
		...(wpConfig.rules || {}),
		'function-url-quotes': 'always',
		'no-descending-specificity': null,
		'selector-class-pattern': null,
		'color-hex-length': 'long',
		'comment-empty-line-before': null,
		'value-keyword-case': null,
		'rule-empty-line-before': null,
		'at-rule-no-unknown': null,
		'scss/at-rule-no-unknown': true,
		'at-rule-empty-line-before': [
			'always',
			{
				except: ['blockless-after-blockless', 'first-nested'],
				ignore: ['after-comment'],
			},
		],
	},
	ignoreFiles: [
		...(wpConfig.ignoreFiles || []),
		'coverage/**/*.css',
		'packages/global-packages/packages/dev-cypress/**/*.css',
		'packages/global-packages/packages/dev-cypress/**/*.scss',
		'packages/global-packages/packages/dev-storybook/**/*.css',
		'packages/global-packages/packages/dev-storybook/**/*.scss',
		'packages/blockera-pro-admin/js/style.scss',
	],
	customSyntax: postcssScss, // MUST be last to prevent override
};
