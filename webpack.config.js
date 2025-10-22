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
	const BLOCKERA_GUARD_MAIN_NAME = 'guard';
	const BLOCKERA_GUARD_NICKNAME = 'features-manager';
	const blockeraPackages = Object.keys(dependencies)
		.filter((packageName) => packageName.startsWith(BLOCKERA_NAMESPACE))
		.map((packageName) => packageName.replace(BLOCKERA_NAMESPACE, ''))
		.map((packageName) => {
			if (BLOCKERA_GUARD_MAIN_NAME === packageName) {
				// Rename guard package to feature-manager to avoid exposing security functionality
				packageName = BLOCKERA_GUARD_NICKNAME;
			}

			return packageName;
		});
	const blockeraPackagesVersion = Object.fromEntries(
		blockeraPackages.map((packageName) => {
			let parentDirectory = '';
			let name = packageName;

			if (-1 !== packageName.indexOf('block-')) {
				name = name.split('block-')[1];
				parentDirectory = 'blocks-library/';
			} else if (-1 !== packageName.indexOf('feature-')) {
				name = name.split('feature-')[1];
				parentDirectory = 'features-library/';
			}

			if (BLOCKERA_GUARD_NICKNAME === name) {
				name = BLOCKERA_GUARD_MAIN_NAME;
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

		if (
			!blockeraPackagesVersion[packageName] &&
			packageName === BLOCKERA_GUARD_NICKNAME &&
			!blockeraPackagesVersion[BLOCKERA_GUARD_MAIN_NAME]
		) {
			return memo;
		}

		let parentDirectory = '';
		let _packageName =
			packageName === BLOCKERA_GUARD_NICKNAME
				? BLOCKERA_GUARD_MAIN_NAME
				: packageName;
		if (-1 !== packageName.indexOf('block-')) {
			_packageName = _packageName.split('block-')[1];
			parentDirectory = 'blocks-library/';
		} else if (-1 !== packageName.indexOf('feature-')) {
			_packageName = _packageName.split('feature-')[1];
			parentDirectory = 'features-library/';
		}
		const version =
			packageName === BLOCKERA_GUARD_NICKNAME
				? blockeraPackagesVersion[BLOCKERA_GUARD_MAIN_NAME]
				: blockeraPackagesVersion[packageName];

		let name = packageName.startsWith('blockera')
			? camelCaseDash(packageName + '_' + version)
			: camelCaseDash('blockera-' + packageName + '_' + version);

		if ('icons' === packageName) {
			name = packageName.startsWith('blockera')
				? camelCaseDash(packageName)
				: camelCaseDash('blockera-' + packageName);
		}

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
		entry: Object.fromEntries(
			Object.entries(blockeraEntries).filter(([entry]) => {
				if (BLOCKERA_GUARD_NICKNAME === entry) {
					return false;
				}

				return true;
			})
		),
		devtoolNamespace: 'blockera-pro',
		mode: argv?.mode || 'production',
		externals: {
			// Externalize the local packages.
			'@blockera/icons': 'blockeraIcons',
			'@blockera/env': 'blockeraEnv_' + blockeraPackagesVersion.env,
			'@blockera/telemetry':
				'blockeraTelemetry_' + blockeraPackagesVersion.telemetry,
			'@blockera/storage':
				'blockeraStorage_' + blockeraPackagesVersion.storage,
			'@blockera/data': 'blockeraData_' + blockeraPackagesVersion.data,
			'@blockera/utils': 'blockeraUtils_' + blockeraPackagesVersion.utils,
			'@blockera/editor':
				'blockeraEditor_' + blockeraPackagesVersion.editor,
			'@blockera/block-icon':
				'blockeraBlockIcon_' + blockeraPackagesVersion['block-icon'],
			'@blockera/blocks-core':
				'blockeraBlocksCore_' + blockeraPackagesVersion['blocks-core'],
			'@blockera/feature-icon':
				'blockeraFeatureIcon_' +
				blockeraPackagesVersion['feature-icon'],
			'@blockera/features-core':
				'blockeraFeaturesCore_' +
				blockeraPackagesVersion['features-core'],
			'@blockera/controls':
				'blockeraControls_' + blockeraPackagesVersion.controls,
			'@blockera/bootstrap':
				'blockeraBootstrap_' + blockeraPackagesVersion.bootstrap,
			'@blockera/wordpress':
				'blockeraWordpress_' + blockeraPackagesVersion.wordpress,
			'@blockera/classnames':
				'blockeraClassnames_' + blockeraPackagesVersion.classnames,
			'@blockera/data-editor':
				'blockeraDataEditor_' + blockeraPackagesVersion['data-editor'],
			'@blockera/feature-manager':
				'blockeraFeatureManager_' + blockeraPackagesVersion.guard,
		},
	});
};
