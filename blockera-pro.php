<?php
/**
 * Plugin Name: Blockera PRO
 * Plugin URI: https://blockera.ai/products/site-builder/
 * Description: The Premium Advanced Mode for Block Editor
 * Requires at least: 6.6
 * Tested up to: 6.7
 * Requires PHP: 7.4
 * Author: Blockera AI
 * Author URI: https://blockera.ai/about/
 * Version: 1.0.0
 * Text Domain: blockera-pro
 * License: GPLv3 or later
 *
 * @package Blockera PRO
 */

// security code.
if ( ! defined( 'ABSPATH' ) ) {

	die( 'Access Denied!' );
}

// loading autoloader.
require __DIR__ . '/vendor/autoload.php';

// Env Loading ...
$dotenv = Dotenv\Dotenv::createImmutable( __DIR__ );
$dotenv->safeLoad();

define( 'BLOCKERA_PRO_FILE', __FILE__ );
define( 'BLOCKERA_PRO_URI', plugin_dir_url( __FILE__ ) );
define( 'BLOCKERA_PRO_PATH', plugin_dir_path( __FILE__ ) );

### BEGIN AUTO-GENERATED DEFINES
define( 'BLOCKERA_PRO_APP_MODE', 'development' );
// Loads current version for development in the development environment.
// this code will be replaced by string version of plugin version pulled from header
// in production build.
if ( ! function_exists( 'get_plugin_data' ) ) {
	require_once( ABSPATH . 'wp-admin/includes/plugin.php' );
}
define( 'BLOCKERA_PRO_VERSION', get_plugin_data( __FILE__ )['Version'] );
### END AUTO-GENERATED DEFINES

add_action( 'plugins_loaded', 'blockera_pro_init', 5 );

function blockera_pro_init() {

	### BEGIN AUTO-GENERATED FRONT CONTROLLERS
	add_action( 'blockera/before/setup', 'blockera_pro_before_setup_free_version' );

	/**
	 * Setup premium version of blockera advanced mode for Block editor.
	 *
	 * @return void
	 */
	function blockera_pro_before_setup_free_version(): void {

		// loading bootstrapper files.
		blockera_load( 'packages.blockera-pro.php.hooks', __DIR__ );
		blockera_load( 'packages.blockera-pro-admin.php.hooks', __DIR__ );
	}

	add_action( 'blockera/after/setup', 'blockera_pro_after_setup_free_version' );

	function blockera_pro_after_setup_free_version(): void {

		// loading front controller.
		require BLOCKERA_PRO_PATH . 'packages/blockera-pro/php/app.php';
	}
	### END AUTO-GENERATED FRONT CONTROLLERS
}
