<?php
/**
 * Example usage of the Notice class
 * 
 * @phpcs:disable
 */

use Blockera\Notice\Notice;

// Initialize the notice system
add_action(
    'init',
    function () {
		Notice::init();
	}
);

/**
 * Example 1: Basic Success Notice
 */
function example_add_success_notice() {
    Notice::add_success(
        'Settings saved successfully!',
        'Success',
        [
			'dismissible' => true,
			'persistent' => false,
		]
	);
}

/**
 * Example 2: Error Notice with Actions
 */
function example_add_error_notice() {
    Notice::add_notice(
        [
			'type' => 'error',
			'title' => 'Error',
			'message' => 'Failed to update plugin.',
			'dismissible' => true,
			'persistent' => true,
			'actions' => [
				[
					'label' => 'Try Again',
					'url' => admin_url('plugins.php'),
					'class' => 'button-primary',
				],
				[
					'label' => 'Get Help',
					'url' => 'https://support.example.com',
					'class' => 'button-secondary',
				],
			],
		]
	);
}

/**
 * Example 3: Warning Notice for Specific Users
 */
function example_add_warning_notice() {
     // Only show to administrators
    if (current_user_can('manage_options')) {
        Notice::add_warning(
            'Your license will expire soon.',
            'License Warning',
            [
                'persistent' => true,
                'context' => 'admin',
            ]
        );
    }
}

/**
 * Example 4: Info Notice for Plugin Updates
 */
function example_add_update_notice() {
    Notice::add_info(
        'A new version is available. Please update your plugin.',
        'Update Available',
        [
			'dismissible' => true,
			'persistent' => true,
			'context' => 'plugin-update',
		]
	);
}

/**
 * Example 5: Bulk Notices
 */
function example_add_bulk_notices() {
     // Add multiple notices at once
    $notices = [
        [
            'type' => 'success',
            'message' => 'Database backup completed.',
            'dismissible' => true,
        ],
        [
            'type' => 'warning',
            'message' => 'Some files need attention.',
            'dismissible' => true,
        ],
        [
            'type' => 'info',
            'message' => 'New features available.',
            'dismissible' => true,
        ],
    ];

    foreach ($notices as $notice) {
        Notice::add_notice($notice);
    }
}

/**
 * Example 6: Contextual Notice in Meta Box
 */
function example_add_meta_box_notice() {
    Notice::add_notice(
        [
			'type' => 'info',
			'message' => 'Optimize your content for better SEO.',
			'context' => 'meta-box',
			'dismissible' => true,
			'persistent' => false,
		]
	);
}

/**
 * Example 7: Notice with Custom Timing
 */
function example_add_timed_notice() {
     // Add notice that will be shown for 24 hours
    $notice_id = Notice::add_notice(
        [
			'type' => 'info',
			'message' => 'Limited time offer!',
			'dismissible' => true,
			'persistent' => true,
			'meta' => [
				'expiry_date' => date('Y-m-d H:i:s', strtotime('+24 hours')),
			],
		]
    );

    // Schedule cleanup
    wp_schedule_single_event(
        strtotime('+24 hours'),
        'remove_expired_notice',
        [ $notice_id ]
    );
}

/**
 * Example 8: Remove Notice Programmatically
 */
function example_remove_notice( $notice_id) {
     Notice::remove_notice($notice_id);
}

/**
 * Example 9: Dismiss Notice for Current User
 */
function example_dismiss_notice( $notice_id) {
     Notice::dismiss_notice($notice_id);
}

/**
 * Example 10: Hook into Admin Pages
 */
function example_admin_page_notices() {
     // Add notice specific to a plugin settings page
    if (isset($_GET['page']) && $_GET['page'] === 'my-plugin-settings') {
        Notice::add_info(
            'These settings affect how your plugin works.',
            'Settings Info',
            [
                'dismissible' => true,
                'context' => 'settings-page',
            ]
        );
    }
}
add_action('admin_init', 'example_admin_page_notices');

/**
 * Example Usage in Plugin Activation
 */
function example_plugin_activation() {
    Notice::add_success(
        'Plugin activated successfully! Click here to configure settings.',
        'Welcome',
        [
			'persistent' => true,
			'actions' => [
				[
					'label' => 'Configure Now',
					'url' => admin_url('admin.php?page=my-plugin-settings'),
					'class' => 'button-primary',
				],
			],
		]
	);
}
register_activation_hook(__FILE__, 'example_plugin_activation');

/**
 * Example Usage in AJAX Handler
 */
function example_ajax_handler() {
     check_ajax_referer('my_plugin_nonce', 'nonce');

    try {
        // Your AJAX logic here
        $result = do_something();

        if ($result) {
            Notice::add_success('Operation completed successfully!');
            wp_send_json_success([ 'message' => 'Success' ]);
        } else {
            Notice::add_error('Operation failed.');
            wp_send_json_error([ 'message' => 'Failed' ]);
        }
    } catch (Exception $e) {
        Notice::add_error(
            $e->getMessage(),
            'Error',
            [ 'persistent' => true ]
        );
        wp_send_json_error([ 'message' => $e->getMessage() ]);
    }
}
add_action('wp_ajax_my_plugin_action', 'example_ajax_handler');

/**
 * Example Usage in Plugin Update
 */
function example_plugin_update_notice() {
     global $pagenow;

    if ($pagenow === 'plugins.php') {
        $current_version = '1.0.0';
        $new_version     = '1.1.0';

        if (version_compare($current_version, $new_version, '<')) {
            Notice::add_warning(
                sprintf(
                    'A new version (%s) of the plugin is available. Please update for new features and security fixes.',
                    $new_version
                ),
                'Update Available',
                [
                    'persistent' => true,
                    'actions' => [
                        [
                            'label' => 'Update Now',
                            'url' => wp_nonce_url(
                                admin_url('update.php?action=upgrade-plugin&plugin=my-plugin'),
                                'upgrade-plugin_my-plugin'
                            ),
                            'class' => 'button-primary',
                        ],
                        [
                            'label' => 'View Changes',
                            'url' => 'https://example.com/changelog',
                            'class' => 'button-secondary',
                        ],
                    ],
                ]
            );
        }
    }
}
add_action('admin_init', 'example_plugin_update_notice');
