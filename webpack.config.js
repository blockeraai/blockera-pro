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
const freeDependencies = require('./dependencies.json');
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
	const BLOCKERA_GUARD_NICKNAME = 'feature-manager';
	const PRO_SUFFIX = '-pro';
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
	let blockeraPackagesVersion = Object.fromEntries(
		blockeraPackages.map((packageName) => {
			let parentDirectory = '';
			let name = packageName;

			if (-1 !== packageName.indexOf('blocks-')) {
				parentDirectory = 'blocks/';
				name = name.split('blocks-')[1];
			}

			let version;

			if (
				-1 === name.indexOf(PRO_SUFFIX) &&
				BLOCKERA_GUARD_NICKNAME !== name &&
				'validator' !== name &&
				// FIXME: please remove this dependency because it's exists in the free blockera version.
				'utils' !== name
			) {
				const {
					version: _v,
				} = require(`../blockera/packages/${parentDirectory}${name}/package.json`);

				version = _v;
			} else {
				if (BLOCKERA_GUARD_NICKNAME === name) {
					packageName = name = 'guard';
				}

				const {
					version: _v,
				} = require(`./packages/${parentDirectory}${name}/package.json`);

				version = _v;
			}

			return [packageName, version.replace(/\./g, '_')];
		})
	);
	blockeraPackagesVersion = {
		...freeDependencies,
		...blockeraPackagesVersion,
	};
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

		const parentDirectory = '';
		const _packageName =
			packageName === BLOCKERA_GUARD_NICKNAME
				? BLOCKERA_GUARD_MAIN_NAME
				: packageName;
		const version =
			packageName === BLOCKERA_GUARD_NICKNAME
				? blockeraPackagesVersion[BLOCKERA_GUARD_MAIN_NAME]
				: blockeraPackagesVersion[packageName];

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
		entry: Object.fromEntries(
			Object.entries(blockeraEntries).filter(([entry]) => {
				if (
					-1 === entry.indexOf(PRO_SUFFIX) &&
					BLOCKERA_GUARD_NICKNAME !== entry
				) {
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
			'@blockera/auth': 'blockeraAuth_' + blockeraPackagesVersion.auth,
			'@blockera/storage':
				'blockeraStorage_' + blockeraPackagesVersion.storage,
			'@blockera/data': 'blockeraData_' + blockeraPackagesVersion.data,
			'@blockera/editor':
				'blockeraEditor_' + blockeraPackagesVersion.editor,
			'@blockera/core-blocks':
				'blockeraBlocksCore_' + blockeraPackagesVersion['blocks-core'],
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
