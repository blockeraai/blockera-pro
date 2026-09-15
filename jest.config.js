/**
 * Pro Jest: product packages only.
 * Shared GP unit tests run in blockera / global-packages, not here.
 */
const fs = require( 'fs' );
const path = require( 'path' );

const base = require( './packages/global-packages/packages/dev-jest/js/jest.config.js' );

const packagesDir = path.join( __dirname, 'packages' );
const productRoots = fs
	.readdirSync( packagesDir, { withFileTypes: true } )
	.filter(
		( entry ) => entry.isDirectory() && entry.name !== 'global-packages'
	)
	.map( ( entry ) => path.join( packagesDir, entry.name ) );

module.exports = {
	...base,
	roots: productRoots,
	collectCoverageFrom: productRoots.map( ( root ) => `${ root }/**/*.js` ),
	testPathIgnorePatterns: [
		...( base.testPathIgnorePatterns || [] ),
		'/packages/global-packages/',
	],
};
