<?php

return [
	'name'          => 'blockera-pro',
	'root_url'      => BLOCKERA_PRO_URI,
	'root_path'     => BLOCKERA_PRO_PATH,
	'packages_url'  => BLOCKERA_PRO_URI . 'packages/',
	'packages_path' => BLOCKERA_PRO_PATH . 'packages/',
	'version'       => blockera_core_env( 'VERSION' ),
	'namespaces'    => [
		'controllers' => '\Blockera\Pro\Http\Controllers\\',
	],
	'debug'         => blockera_core_env( 'APP_MODE' ) && 'development' === blockera_core_env( 'APP_MODE' ) || ( ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ),
	'providers'     => [
		\Blockera\Pro\Providers\AssetProvider::class,
		\Blockera\Pro\Providers\AppServiceProvider::class,
		\Blockera\Pro\Admin\Providers\AdminAssetsProvider::class,
	],
];
