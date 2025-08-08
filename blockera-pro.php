<?php
/**
 * Plugin Name: Blockera Site Builder [PRO]
 * Plugin URI: https://blockera.ai/products/site-builder/pricing/
 * Description: Unlock the full power of Blockera Site Builder with the PRO version.
 * Requires at least: 6.6
 * Tested up to: 6.8
 * Requires PHP: 7.4
 * Author: Blockera AI
 * Author URI: https://blockera.ai/about/
 * Version: 1.1.1
 * Text Domain: blockera-pro
 * License: GPLv3 or later
 *
 * @package Blockera Pro
 */

use Blockera\Auth\Repositories\OptionRepository;

// security code.
if (! defined('ABSPATH')) {

    die('Access Denied!');
}

// loading autoloader.
require __DIR__ . '/vendor/autoload.php';

// Register into shared autoload coordinator.
require_once __DIR__ . '/packages/autoloader-coordinator/class-shared-autoload-coordinator.php';
\Blockera\SharedAutoload\Coordinator::getInstance()->registerPlugin('blockera-pro', __DIR__);
\Blockera\SharedAutoload\Coordinator::getInstance()->bootstrap();

if (file_exists(__DIR__ . '/.env')) {
	
	// Env Loading ...
	$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
	$dotenv->safeLoad();
}

define('BLOCKERA_PRO_FILE', __FILE__);
define('BLOCKERA_PRO_URI', plugin_dir_url(__FILE__));
define('BLOCKERA_PRO_PATH', plugin_dir_path(__FILE__));

### BEGIN AUTO-GENERATED DEFINES
define('BLOCKERA_PRO_APP_MODE', 'development');
// Loads current version for development in the development environment.
// this code will be replaced by string version of plugin version pulled from header
// in production build.
if (! function_exists('get_plugin_data')) {
    require_once(ABSPATH . 'wp-admin/includes/plugin.php');
}
define('BLOCKERA_PRO_VERSION', get_plugin_data(__FILE__, true, false)['Version']);
### END AUTO-GENERATED DEFINES

add_action('plugins_loaded', 'blockera_pro_init', 5);

function blockera_pro_init(): void {
    add_action('blockera/before/setup', 'blockera_pro_before_setup_free_version');

    /**
     * Setup premium version of blockera advanced mode for Block editor.
     *
     * @return void
     */
    function blockera_pro_before_setup_free_version(): void {
        // loading bootstrapper files.
        blockera_load('vendor.blockera.blockera-pro.php.hooks', __DIR__);
        blockera_load('vendor.blockera.blockera-pro-admin.php.hooks', __DIR__);
    }

    add_action('blockera/after/setup', 'blockera_pro_after_setup_free_version');

    function blockera_pro_after_setup_free_version(): void {
        ### BEGIN AUTO-GENERATED FRONT CONTROLLERS
        // loading front controller.
        require BLOCKERA_PRO_PATH . 'packages/blockera-pro/php/app.php';
        ### END AUTO-GENERATED FRONT CONTROLLERS
		
		if (class_exists(Blockera\Auth\Jobs::class) && class_exists(Blockera\WordPress\Sender::class)) {
			new \Blockera\Auth\Jobs(
				new \Blockera\WordPress\Sender(),
				include __DIR__ . '/config/auth.php'
			);
		}
    }
}

add_action('admin_init', 'blockera_pro_init_notice');

/**
 * Initialize the notice package.
 *
 * @return void
 */
function blockera_pro_init_notice(): void {
	require_once __DIR__ . '/vendor/blockera/notice/php/Notice.php';
	\Blockera\Notice\Notice::init();

	require_once __DIR__ . '/vendor/blockera/blockera-pro/php/notices.php';
}

register_activation_hook(__FILE__, 'blockera_pro_activation');

/**
 * Activation plugin hook.
 *
 * @return void
 */
function blockera_pro_activation(): void {
	
	if (! wp_next_scheduled('blockera_pro_each_per_day')) {

		wp_schedule_event(time(), 'blockera_pro_1_day', 'blockera_pro_each_per_day');
	}

	if (! wp_next_scheduled('blockera_pro_each_per_ten_days')) {

		wp_schedule_event(time(), 'blockera_pro_10_days', 'blockera_pro_each_per_ten_days');
	}

	add_option(OptionRepository::getOptionKey() . '_do_activation_redirect', true);
}

register_deactivation_hook(__FILE__, 'blockera_pro_deactivation');

/**
 * Deactivation plugin hook.
 *
 * @return void
 */
function blockera_pro_deactivation(): void {

	wp_clear_scheduled_hook('blockera_pro_each_per_day');
}

add_action('admin_notices', 'blockera_pro_redirect_to_activation_page', 9e2);

/**
 * Redirecting your WordPress admin to your plugin activation page after activation it.
 *
 * @return void
 */
function blockera_pro_redirect_to_activation_page(): void {
	
	$optionKey = OptionRepository::getOptionKey() . '_do_activation_redirect';

	// Check if the redirect flag is set and the user has sufficient permissions.
	if (get_option($optionKey, false)) {

		if (! is_plugin_active('blockera/blockera.php')) {

			// Blockera is not active, so we don't need to redirect because blockera settings page is not available.
			return;
		}

		delete_option($optionKey);

		if (is_admin() && current_user_can('activate_plugins')) {

			// Redirect to plugin account page to activate the plugin.
			echo '<script>window.location.href = "' . admin_url('admin.php?page=blockera-settings-account') . '";</script>';
		}
	}
}

add_filter('cron_schedules', 'blockera_pro_add_cron_interval');

/**
 * Add the 1 day schedule on stack.
 *
 * @param array $schedules The schedules array.
 *
 * @return array the new schedules array.
 */
function blockera_pro_add_cron_interval( array $schedules ): array {

    $schedules['blockera_pro_1_day'] = array(
        'interval' => 60 * 60 * 24,
        'display'  => esc_html__('Every Day', 'blockera'),
    );

    $schedules['blockera_pro_10_days'] = array(
        'interval' => 60 * 60 * 24 * 10,
        'display'  => esc_html__('Every Ten Days', 'blockera'),
    );

    return $schedules;
}
