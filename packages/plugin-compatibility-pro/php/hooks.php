<?php

use Blockera\PluginCompatibility\CompatibilityCheck;

add_action(
    'blockera/compatibility/admin-menus',
    function ( string $base_url, CompatibilityCheck $compatibility_check_instance) {
	
		if ('development' === $compatibility_check_instance->get('app_mode')) {
			$filename = 'plugin-compatibility-pro.js';
		} else {
			$filename = 'plugin-compatibility-pro.min.js';
		}

		$asset = WP_PLUGIN_DIR . '/blockera-pro/dist/plugin-compatibility-pro/plugin-compatibility-pro.asset.php';
		if (! file_exists($asset)) {
			return;
		}

		$asset = require $asset;

		wp_enqueue_script(
            'blockera-compat-pro',
            home_url('/wp-content/plugins/blockera-pro') . '/dist/plugin-compatibility-pro/' . $filename,
            $asset['dependencies'],
            $asset['version'],
            [
				'in_footer' => true,
            ],
		);
		
		wp_add_inline_script(
			'blockera-compat-pro',
			'var blockeraAccount = ' . wp_json_encode( blockera_pro_core_config('account') ) . ';',
			'before'
		);
	},
    10,
    2
);

add_filter(
    'blockera/notice/ignored_notices',
    function ( array $ignored_notices) {

		if ('/wp-admin/admin.php?page=blockera-compat' === $_SERVER['REQUEST_URI']) {

			$ignored_notices[] = 'blockera-pro-next-version-available';
		}

		return $ignored_notices;
	}
);
