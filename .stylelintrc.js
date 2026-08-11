const base = require('./packages/global-packages/packages/dev-tools/js/stylelint/config');

module.exports = {
	...base,
	ignoreFiles: [
		...(base.ignoreFiles || []),
		'packages/blockera-pro-admin/js/style.scss',
	],
};
