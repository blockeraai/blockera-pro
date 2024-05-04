<?php
/**
 * Plugin Name:       Blockera PRO
 * Description:       The premium addons for blockera WordPress free plugin.
 * Requires at least: 6.5.2
 * Requires PHP:      7.4
 * Version:           1.0-beta
 * Author:            blockeraai.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       blockera-pro
 *
 * @package Core
 */

// security code.
if ( ! defined( 'ABSPATH' ) ) {

	die( 'Access Denied!' );
}

// loading autoloader.
require __DIR__ . '/vendor/autoload.php';

define( 'BLOCKERA_PRO_FILE', __FILE__ );
define( 'BLOCKERA_PRO_URI', plugin_dir_url( __FILE__ ) );
define( 'BLOCKERA_PRO_PATH', plugin_dir_path( __FILE__ ) );

// Env Loading ...
$dotenv = Dotenv\Dotenv::createImmutable( __DIR__ );
$dotenv->safeLoad();

add_action( 'blockera/after/setup', 'blockera_after_setup' );

function blockera_after_setup(): void {

	// loading front controller.
	require BLOCKERA_PRO_PATH . 'packages/pro-setup/php/app.php';
}
