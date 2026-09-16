/**
 * Pro Jest: Pro packages under global-packages only.
 * Shared GP unit tests run in blockera / global-packages origin, not here.
 */
const fs = require('fs');
const path = require('path');

const base = require('./packages/global-packages/packages/dev-jest/js/jest.config.js');

const gpPackagesDir = path.join(__dirname, 'packages/global-packages/packages');

const PRO_PACKAGE_NAMES = [
	'auth-pro',
	'blockera-pro',
	'blockera-pro-admin',
	'blocks-pro',
	'console-pro',
	'controls-pro',
	'editor-pro',
	'guard-pro',
	'notice-pro',
	'plugin-compatibility-pro',
	'validator-pro',
];

const productRoots = PRO_PACKAGE_NAMES.map((name) =>
	path.join(gpPackagesDir, name)
).filter((dir) => fs.existsSync(dir));

module.exports = {
	...base,
	roots: productRoots,
	collectCoverageFrom: productRoots.map((root) => `${root}/**/*.js`),
};
