// Edit packages/global-packages/packages/dev-tools/root-configs/.stylelintrc.blockera-pro.js
// project:bootstrap copies this to the host repo root for --project=blockera-pro.
const shared = require('./packages/global-packages/packages/dev-tools/js/stylelint/config');

module.exports = {
	...shared,
	ignoreFiles: [
		...(shared.ignoreFiles || []),
		'packages/*-one/**',
		'packages/*-one-*/**',
		'packages/global-packages/packages/**/*-one/**',
		'packages/global-packages/packages/**/*-one-*/**',
		'packages/*-toolkit/**',
		'packages/*-toolkit-*/**',
		'packages/global-packages/packages/**/*-toolkit/**',
		'packages/global-packages/packages/**/*-toolkit-*/**',
	],
};
