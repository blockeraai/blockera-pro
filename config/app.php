<?php
/**
 * Direct access is not allowed.
 *
 * @package config/app.php
 */

if ( ! defined( 'ABSPATH' ) ) {

	exit;
}

$env_mode = 'development' === blockera_core_env( 'APP_MODE', 'production' );

return [
	'name'          => 'blockera-pro',
	'root_url'      => BLOCKERA_PRO_URI,
	'root_path'     => BLOCKERA_PRO_PATH,
	'dist_url'      => BLOCKERA_PRO_URI . 'dist/',
	'dist_path'     => BLOCKERA_PRO_PATH . 'dist/',
	'packages_url'  => BLOCKERA_PRO_URI . 'packages/',
	'version'       => defined( 'BLOCKERA_PRO_VERSION' ) ? BLOCKERA_PRO_VERSION : blockera_core_env( 'VERSION' ),
	'packages_path' => blockera_core_env( 'APP_MODE', 'production' ) === 'development' ? BLOCKERA_PRO_PATH . 'packages/' : BLOCKERA_PRO_PATH . 'vendor/',
	'namespaces'    => [
		'controllers' => '\Blockera\Pro\Http\Controllers\\',
	],
	'vendor_path'   => BLOCKERA_PRO_PATH . 'vendor/',
	'debug'         => defined( 'BLOCKERA_PRO_APP_MODE' ) && 'development' === BLOCKERA_PRO_APP_MODE && $env_mode,
	/**
	 * Extendable blockera application providers by external developers.
	 *
	 * @since 1.0.0
	 */
	'providers'     => [
		\Blockera\Pro\Providers\AppServiceProvider::class,
		\Blockera\Guard\Providers\GuardAssetProvider::class,
		\Blockera\Pro\Providers\BlockeraPRORestAPIProvider::class,
	],
];
