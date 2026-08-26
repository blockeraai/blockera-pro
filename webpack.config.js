/**
 * External dependencies
 */
const fs = require('fs');
const path = require('path');

/**
 * Internal dependencies
 */
const { dependencies } = require('./package');
const packagesConfig = require('./packages/global-packages/packages/dev-tools/js/webpack/packages');
const createRootWebpackConfig = require('./packages/global-packages/packages/dev-tools/js/webpack/create-root-config');

const BLOCKERA_GUARD_MAIN_NAME = 'guard';
const BLOCKERA_GUARD_NICKNAME = 'features-manager';

/**
 * Resolve a Blockera package directory after the sparse-submodule migration.
 * Prefer Composer path-repo symlinks, then local Pro packages, then submodule.
 *
 * @param {string} packageName Canonical package slug (e.g. controls-pro, feature-icon).
 * @return {string} Relative package directory from the plugin root.
 */
function resolvePackageDir(packageName) {
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

module.exports = createRootWebpackConfig({
	dependencies,
	packagesConfig,
	resolvePackageDir,
	devtoolNamespace: 'blockera-pro',
	// Rename guard → features-manager so security package name is not exposed in version/externals keys.
	mapPackageName: (packageName) =>
		packageName === BLOCKERA_GUARD_MAIN_NAME
			? BLOCKERA_GUARD_NICKNAME
			: packageName,
	resolveCanonicalPackageName: (packageName) =>
		packageName === BLOCKERA_GUARD_NICKNAME
			? BLOCKERA_GUARD_MAIN_NAME
			: packageName,
	// Keep nickname in the version map for `@blockera/feature-manager`, but do not emit an entry.
	shouldIncludeEntry: (packageName) =>
		packageName !== BLOCKERA_GUARD_NICKNAME,
	getExternals: (blockeraPackagesVersion) => ({
		'@blockera/icons': 'blockeraIcons',
		'@blockera/env': 'blockeraEnv_' + blockeraPackagesVersion.env,
		'@blockera/telemetry':
			'blockeraTelemetry_' + blockeraPackagesVersion.telemetry,
		'@blockera/storage':
			'blockeraStorage_' + blockeraPackagesVersion.storage,
		'@blockera/data': 'blockeraData_' + blockeraPackagesVersion.data,
		'@blockera/utils': 'blockeraUtils_' + blockeraPackagesVersion.utils,
		'@blockera/editor': 'blockeraEditor_' + blockeraPackagesVersion.editor,
		'@blockera/blocks-core':
			'blockeraBlocksCore_' + blockeraPackagesVersion['blocks-core'],
		'@blockera/feature-icon':
			'blockeraFeatureIcon_' + blockeraPackagesVersion['feature-icon'],
		'@blockera/features-core':
			'blockeraFeaturesCore_' + blockeraPackagesVersion['features-core'],
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
	}),
});
