<?php

use Blockera\Notice\Notice;

global $notice_cache_key, $cached_notice_id;

$notice_cache_key = 'blockera_pro_notice_blockera_required';
$cached_notice_id = get_option($notice_cache_key);

/**
 * Remove the notice when Blockera is activated.
 *
 * @return bool true on success, false on failure.
 */
function blockera_pro_remove_notice_blockera_required() {
	global $notice_cache_key, $cached_notice_id;

	if ($cached_notice_id) {
		$deleted_option = delete_option($notice_cache_key);
		$removed_notice = Notice::remove_notice($cached_notice_id);

		return $deleted_option && $removed_notice;	
	}

	return false;
}

// Remove the notice when Blockera is activated.
add_action(
    'activated_plugin',
    function( $plugin) {
		if ('blockera/blockera.php' === $plugin) {
			blockera_pro_remove_notice_blockera_required();
		}
	}
);

if (is_plugin_active('blockera/blockera.php')) {
	blockera_pro_remove_notice_blockera_required();

    return;
}

if (! $cached_notice_id) {
	$notice_id = Notice::add_notice(
        [
			'type' => 'error',
			'title' => '🚨 Blockera plugin is required',
			'message' => 'Blockera plugin is not active. Please activate it to unlock the full power of Blockera Pro and enjoy an enhanced site building experience.',
			'dismissible' => true,
			'persistent' => true,
			'actions' => [
				[
					'label' => __('Activate Blockera', 'blockera'),
					'url' => wp_nonce_url(
						admin_url('plugins.php?action=activate&plugin=blockera/blockera.php'),
						'activate-plugin_blockera/blockera.php'
					),
					'class' => 'button-primary',
				],
				[
					'label' => __('Install Blockera', 'blockera'), 
					'url' => admin_url('plugin-install.php?s=blockera&tab=search&type=term'),
					'class' => 'button-secondary',
				],
			],
		]
    );

	update_option($notice_cache_key, $notice_id);
}
