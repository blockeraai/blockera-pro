// Edit packages/global-packages/packages/dev-tools/root-configs/eslint.config.blockera-pro.cjs
// project:bootstrap copies this to the host repo root for --project=blockera-pro.
const {
	createConfig,
} = require( './packages/global-packages/packages/dev-tools/js/eslint/config' );

module.exports = createConfig( {
	extraIgnores: [
		// Pro-only paths (were in root .eslintignore).
		'packages/console/*',
		'wordpress*',
		'packages/*-one/**',
		'packages/*-one-*/**',
		'packages/global-packages/packages/**/*-one/**',
		'packages/global-packages/packages/**/*-one-*/**',
		'packages/*-toolkit/**',
		'packages/*-toolkit-*/**',
		'packages/global-packages/packages/**/*-toolkit/**',
		'packages/global-packages/packages/**/*-toolkit-*/**',
	],
	allowedTextDomains: [ 'blockera', 'blockera-pro' ],
} );
