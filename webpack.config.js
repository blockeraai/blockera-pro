/**
 * External dependencies
 */
const fs = require('fs');
const path = require('path');
const {
	camelCaseDash,
} = require('@wordpress/dependency-extraction-webpack-plugin/lib/util');

/**
 * Internal dependencies
 */
const { dependencies } = require('./package');
const packagesConfig = require('./packages/global-packages/packages/dev-tools/js/webpack/packages');

const exportDefaultPackages = [];

/**
 * Resolve a Blockera package directory after the sparse-submodule migration.
 * Prefer Composer path-repo symlinks, then local Pro packages, then submodule.
 *
 * @param {string} packageName Canonical package slug (e.g. controls-pro, feature-icon).
 * @return {string} Relative package directory from the plugin root.
 */
function resolveBlockeraPackageDir(packageName) {
	const candidates = [
		`./vendor/blockera/${packageName}`,
		`./packages/${packageName}`,
		`./packages/global-packages/packages/${packageName}`,
	];

	// Library packages may still live under features-library/<name> in the submodule.
	if (packageName.startsWith('feature-')) {
		candidates.push(
			`./packages/global-packages/packages/features-library/${packageName.replace(
				'feature-',
				''
			)}`
		);
	}
	if (packageName.startsWith('block-')) {
		candidates.push(
			`./packages/global-packages/packages/blocks-library/${packageName.replace(
				'block-',
				''
			)}`
		);
	}

	for (const candidate of candidates) {
		if (
			fs.existsSync(
				path.resolve(process.cwd(), candidate, 'package.json')
			)
		) {
			return candidate;
		}
	}

	throw new Error(
		`Cannot find Blockera package "${packageName}" under vendor/blockera, packages/, or packages/global-packages/packages/`
	);
}

module.exports = (env, argv) => {
	if (!argv) {
		return require(
			path.resolve(
				process.cwd(),
				'packages/global-packages/packages/dev-cypress/js/webpack.config.js'
			)
		);
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
			const resolvedPackageName =
				packageName === BLOCKERA_GUARD_NICKNAME
					? BLOCKERA_GUARD_MAIN_NAME
					: packageName;
			const packageDir = resolveBlockeraPackageDir(resolvedPackageName);
			const { version } = require(`${packageDir}/package.json`);

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

		const resolvedPackageName =
			packageName === BLOCKERA_GUARD_NICKNAME
				? BLOCKERA_GUARD_MAIN_NAME
				: packageName;
		const version = blockeraPackagesVersion[packageName];
		const packageDir = resolveBlockeraPackageDir(resolvedPackageName);

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
				import: packageDir,
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
		projectRoot: process.cwd(),
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
				'blockeraFeatureManager_' +
				blockeraPackagesVersion[BLOCKERA_GUARD_NICKNAME],
		},
	});
};
