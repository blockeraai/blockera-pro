/**
 * External dependencies
 */
const path = require('path');
const {
	camelCaseDash,
} = require('@wordpress/dependency-extraction-webpack-plugin/lib/util');

/**
 * Internal dependencies
 */
const { dependencies } = require('./package');
const packagesConfig = require('./packages/dev-tools/js/webpack/packages');

const exportDefaultPackages = [];

module.exports = (env, argv) => {
	if (!argv) {
		return require(path.resolve(
			process.cwd(),
			'packages/dev-cypress/js/webpack.config.js'
		));
	}

	const BLOCKERA_NAMESPACE = '@blockera/';
	const blockeraPackages = Object.keys(dependencies)
		.filter((packageName) => packageName.startsWith(BLOCKERA_NAMESPACE))
		.map((packageName) => packageName.replace(BLOCKERA_NAMESPACE, ''));
	const blockeraPackagesVersion = Object.fromEntries(
		blockeraPackages.map((packageName) => {
			let parentDirectory = '';
			let name = packageName;

			if (-1 !== packageName.indexOf('blocks-')) {
				parentDirectory = 'blocks/';
				name = name.split('blocks-')[1];
			}

			const {
				version,
			} = require(`./packages/${parentDirectory}${name}/package.json`);

			return [packageName, version.replace(/\./g, '_')];
		})
	);
	const blockeraEntries = blockeraPackages.reduce((memo, packageName) => {
		// Exclude dev packages.
		if (-1 !== packageName.indexOf('dev-')) {
			return memo;
		}

		if (!blockeraPackagesVersion[packageName]) {
			return memo;
		}

		const parentDirectory = '';
		const _packageName = packageName;
		const version = blockeraPackagesVersion[packageName];

		const name = packageName.startsWith('blockera')
			? camelCaseDash(packageName + '_' + version)
			: camelCaseDash('blockera-' + packageName + '_' + version);

		return {
			...memo,
			[packageName]: {
				import: `./packages/${parentDirectory}${_packageName}`,
				library: {
					name,
					type: 'var',
					export: exportDefaultPackages.includes(packageName)
						? 'default'
						: undefined,
				},
			},
		};
	}, {});

	return packagesConfig(env, {
		...argv,
		entry: blockeraEntries,
		devtoolNamespace: 'blockera-pro',
		mode: argv?.mode || 'production',
	});
};
