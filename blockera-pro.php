<?php
/**
 * Plugin Name: Blockera Site Builder [PRO]
 * Plugin URI: https://blockera.ai/products/site-builder/pricing/
 * Description: Unlock the full power of Blockera Site Builder with the PRO version.
 * Requires at least: 6.6
 * Tested up to: 6.8
 * Requires PHP: 7.4
 * Requires at least blockera: 1.12.2
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

### BEGIN AUTO-GENERATED AUTOLOADER
/**
 * Whether an active companion is missing CompatibilityCheck in its own vendor tree.
 *
 * Older companions cannot run a mutual version check; Pro must force the
 * compatibility flow in that case.
 *
 * @return bool
 */
function blockera_pro_companions_missing_compatibility_check(): bool {

	static $missing = null;

	if ( null !== $missing ) {
		return $missing;
	}

	$relative = 'vendor/blockera/plugin-compatibility/php/CompatibilityCheck.php';

	$companions = [
		[
			'type'        => 'plugin',
			'slug'        => 'blockera',
			'plugin_file' => 'blockera/blockera.php',
		],
		[
			'type'             => 'theme',
			'slug'             => 'blockera-one',
			'theme_stylesheet' => 'blockera-one',
		],
	];

	if ( ! function_exists( 'is_plugin_active' ) ) {
		require_once ABSPATH . 'wp-admin/includes/plugin.php';
	}

	foreach ( $companions as $companion ) {
		$is_theme = 'theme' === ( $companion['type'] ?? 'plugin' );
		if ( $is_theme && wp_get_theme()->get_stylesheet() === $companion['theme_stylesheet'] ) {
			$stylesheet = $companion['theme_stylesheet'];
			$theme      = wp_get_theme();

			// Only active theme (child or parent) counts as a live companion.
			if ( $theme->get_stylesheet() !== $stylesheet && $theme->get_template() !== $stylesheet ) {
				continue;
			}

			$root = get_theme_root( $stylesheet ) . '/' . $stylesheet;

			if ( ! is_readable( $root . '/' . $relative ) ) {
				$missing = true;

				return true;
			}

			continue;
		} elseif ( $is_theme ) {

			continue;
		}

		$plugin_file = $companion['plugin_file'];

		if ( ! is_plugin_active( $plugin_file ) ) {
			continue;
		}

		$check_file = WP_PLUGIN_DIR . '/' . $companion['slug'] . '/' . $relative;

		if ( ! is_readable( $check_file ) ) {
			$missing = true;

			return true;
		}
	}

	$missing = false;

	return false;
}

if ( blockera_pro_companions_missing_compatibility_check() ) {
	$mode = defined( 'BLOCKERA_PRO_APP_MODE' ) && 'development' === BLOCKERA_PRO_APP_MODE && $env_mode;
	require_once __DIR__ . '/vendor/blockera/plugin-compatibility/php/CompatibilityCheck.php';
	$blockera_compat_pro_with_free = new \Blockera\PluginCompatibility\CompatibilityCheck(
		[
			'file' => __FILE__,
			'slug' => 'blockera-pro',
			'version' => get_plugin_data(__FILE__, true, false)['Version'],
			'plugin_path' => plugin_dir_path(__FILE__),
			'compatible_with_slug' => 'blockera',
			'callback' => function () {
				if (! defined('BLOCKERA_PRO_DISABLED_RUNTIME')) {
					define('BLOCKERA_PRO_DISABLED_RUNTIME', true);
				}
			},
			'transient_key' => 'blockera-pro-compat-redirect',
			'mode' => $mode ? 'development' : 'production',
			// Companions without CompatibilityCheck cannot mutual-check Pro; force incompat UI.
			'force' => blockera_pro_companions_missing_compatibility_check(),
		],
		new Blockera\Utils\Utils()
	);
	
	$blockera_compat_pro_with_free->load();

	// Add compatibility check hooks.
	add_action( 'admin_init', [ $blockera_compat_pro_with_free, 'adminInitialize' ] );
	add_action( 'admin_menu', [ $blockera_compat_pro_with_free, 'adminMenus' ] );

	return;
}
require_once __DIR__ . '/packages/autoloader-coordinator/bootstrap.php';
blockera_bootstrap_shared_autoloader(
	'blockera-pro',
	__DIR__,
	[
		'priority'          => 20,
		'default'           => ! defined('BLOCKERA_SB_FILE'),
		'file'              => __FILE__,
		'entry_constant'    => 'BLOCKERA_PRO_FILE',
		'defer_files_until' => [ 'blockera' ],
		'companions'        => [
			[
				'slug'           => 'blockera',
				'plugin_file'    => 'blockera/blockera.php',
				'entry_constant' => 'BLOCKERA_SB_FILE',
			],
			[
				'slug'             => 'blockera-one',
				'type'             => 'theme',
				'theme_stylesheet' => 'blockera-one',
			],
		],
	]
);
### END AUTO-GENERATED AUTOLOADER

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

/**
 * Check if Blockera PRO is enabled.
 *
 * @return bool Whether Blockera PRO is enabled.
 */
function blockera_pro_is_enabled(): bool {

    $forcedDisabled = (bool) get_option('blockera_pro_force_disabled', false);
    $enabled        = ! $forcedDisabled;
    
	/**
     * Allow external control of Blockera PRO enablement.
     *
     * @param bool $enabled Whether PRO is enabled.
     */
    $enabled = (bool) apply_filters('blockera_pro/is_enabled', $enabled);
    
	if (defined('BLOCKERA_PRO_DISABLED_RUNTIME') && BLOCKERA_PRO_DISABLED_RUNTIME) {
        $enabled = false;
    }

    return $enabled;
}

// Add the account page URL to the list of specific pages that should redirect to the dashboard.
// when the Pro plugin is not compatible with the free version. The account page won't exist.
// until compatibility is restored.
add_filter(
    'blockera/compatibility/specific_pages',
    function ( array $specific_pages): array {

		return array_merge(
            $specific_pages,
            [ '/wp-admin/admin.php?page=blockera-settings-account' ]
		);
	}
);

add_action('plugins_loaded', 'blockera_pro_init', 5);

/**
 * Initialize Blockera PRO.
 *
 * @return void
 */
function blockera_pro_init(): void {

	if (file_exists(__DIR__ . '/.env')) {		
		// Env Loading ...
		$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
		$dotenv->safeLoad();
	}

	$env_mode = 'development' === ( $_ENV['APP_MODE'] ?? 'production' );
	$mode     = defined('BLOCKERA_PRO_APP_MODE') && 'development' === BLOCKERA_PRO_APP_MODE && $env_mode;

	global $blockera_compat_pro_with_free, $is_compatible_with_free;

	$blockera_compat_pro_with_free = new \Blockera\PluginCompatibility\CompatibilityCheck(
		[
			'file' => __FILE__,
			'slug' => 'blockera-pro',
			'version' => BLOCKERA_PRO_VERSION,
			'plugin_path' => BLOCKERA_PRO_PATH,
			'compatible_with_slug' => 'blockera',
			'callback' => function () {
				if (! defined('BLOCKERA_PRO_DISABLED_RUNTIME')) {
					define('BLOCKERA_PRO_DISABLED_RUNTIME', true);
				}
			},
			'transient_key' => 'blockera-pro-compat-redirect',
			'mode' => $mode ? 'development' : 'production',
			// Companions without CompatibilityCheck cannot mutual-check Pro; force incompat UI.
			'force' => blockera_pro_companions_missing_compatibility_check(),
		],
		new Blockera\Utils\Utils()
	);

	$is_compatible_with_free = $blockera_compat_pro_with_free->load();

    add_action('blockera/before/setup', 'blockera_pro_before_setup_free_version');

    /**
     * Setup premium version of blockera advanced mode for Block editor.
     *
     * @return void
     */
    function blockera_pro_before_setup_free_version(): void {

		blockera_load('vendor.blockera.plugin-compatibility-pro.php.hooks', __DIR__);

		global $blockera_compat_pro_with_free, $is_compatible_with_free;

		if (! $is_compatible_with_free) {
			// Add compatibility check hooks.
			add_action('admin_init', [ $blockera_compat_pro_with_free, 'adminInitialize' ]);
			add_action('admin_menu', [ $blockera_compat_pro_with_free, 'adminMenus' ]);	
		}

		// Gate: if Pro is disabled, do not bootstrap functionality.
		if (! function_exists('blockera_pro_is_enabled') || ! blockera_pro_is_enabled()) {
			return;
		}

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

	// Gate: if Pro is disabled, do not bootstrap functionality.
	if (! function_exists('blockera_pro_is_enabled') || ! blockera_pro_is_enabled()) {
		return;
	}
	
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
