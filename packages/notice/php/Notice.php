<?php

namespace Blockera\Notice;

/**
 * 
 * Notice class for WordPress integration
 * 
 * @phpcs:disable
 */
class Notice {

    /**
     * Initialize the notice system
     * 
     * @return void
     */
    public static function init(): void {
        add_action('admin_notices', [ __CLASS__, 'render_admin_notices' ]);
        add_action('wp_ajax_blockera_dismiss_notice', [ __CLASS__, 'handle_dismiss_notice' ]);
        add_action('wp_ajax_blockera_get_notices', [ __CLASS__, 'handle_get_notices' ]);
        add_action('rest_api_init', [ __CLASS__, 'register_rest_routes' ]);
    }

    /**
     * Render admin notices
     * 
     * @return void
     */
    public static function render_admin_notices(): void {
        $notices = self::get_admin_notices();

        foreach ($notices as $notice) {
            self::render_notice($notice);
        }
    }

    /**
     * Get admin notices
     * 
     * @return array
     */
    public static function get_admin_notices(): array {
        $notices   = get_option('blockera_admin_notices', []);
        $dismissed = get_user_meta(get_current_user_id(), 'blockera_dismissed_notices', true);
        $dismissed = is_array($dismissed) ? $dismissed : [];

        // Filter out dismissed notices
        return array_filter(
            $notices,
            function ( array $notice) use ( $dismissed): bool {
				return ! in_array($notice['id'], $dismissed);
			}
        );
    }

	/**
	 * Update a notice
	 * 
	 * @param string $notice_id Notice ID
	 * @param array  $notice Notice data
	 * @return bool Success
	 */
	public static function update_admin_notice( string $notice_id, array $notice): bool {
		$notices = get_option('blockera_admin_notices', []);
		$notices[ $notice_id ] = $notice;
		update_option('blockera_admin_notices', $notices);

		return true;
	}

    /**
     * Add a notice
     * 
     * @param array $notice Notice data
     * @return string Notice ID
     */
    public static function add_notice( array $notice): string {
        $notices = get_option('blockera_admin_notices', []);

        $notice = wp_parse_args(
            $notice,
            [
				'id' => uniqid('notice_'),
				'type' => 'info',
				'message' => '',
				'title' => '',
				'dismissible' => true,
				'persistent' => false,
				'context' => 'admin',
				'actions' => [],
			]
        );

        $notices[ $notice['id'] ] = $notice;
        update_option('blockera_admin_notices', $notices);

        return $notice['id'];
    }

    /**
     * Remove a notice
     * 
     * @param string $notice_id Notice ID
     * @return bool Success
     */
    public static function remove_notice( string $notice_id): bool {
        $notices = get_option('blockera_admin_notices', []);

        if (isset($notices[ $notice_id ])) {
            unset($notices[ $notice_id ]);
            update_option('blockera_admin_notices', $notices);
            return true;
        }

        return false;
    }

    /**
     * Dismiss a notice
     * 
     * @param string   $notice_id Notice ID
     * @param int|null $user_id User ID
     * @return bool Success
     */
    public static function dismiss_notice( string $notice_id, ?int $user_id = null): bool {
        if (! $user_id) {
            $user_id = get_current_user_id();
        }

        $dismissed = get_user_meta($user_id, 'blockera_dismissed_notices', true);
        $dismissed = is_array($dismissed) ? $dismissed : [];

        if (! in_array($notice_id, $dismissed)) {
            $dismissed[] = $notice_id;
            update_user_meta($user_id, 'blockera_dismissed_notices', $dismissed);
        }

        return true;
    }

    /**
     * Render a single notice
     * 
     * @param array $notice Notice data
     * @return void
     */
    public static function render_notice( array $notice): void {
        include_once __DIR__ . '/templates/base-notice.php';
    }

    /**
     * Handle AJAX dismiss notice
     * 
     * @return void
     */
    public static function handle_dismiss_notice(): void {
        check_ajax_referer('blockera_notice_nonce', 'nonce');

        $notice_id = sanitize_text_field($_POST['notice_id'] ?? '');

        if (empty($notice_id)) {
            wp_die('Invalid notice ID');
        }

        $result = self::dismiss_notice($notice_id);

        wp_send_json_success([ 'dismissed' => $result ]);
    }

    /**
     * Handle AJAX get notices
     * 
     * @return void
     */
    public static function handle_get_notices(): void {
        check_ajax_referer('blockera_notice_nonce', 'nonce');

        $notices = self::get_admin_notices();

        wp_send_json_success([ 'notices' => $notices ]);
    }

    /**
     * Register REST API routes
     * 
     * @return void
     */
    public static function register_rest_routes(): void {
        register_rest_route(
            'blockera/v1',
            '/notices',
            [
				'methods' => 'GET',
				'callback' => [ __CLASS__, 'rest_get_notices' ],
				'permission_callback' => [ __CLASS__, 'rest_permission_check' ],
			]
        );

        register_rest_route(
            'blockera/v1',
            '/notices',
            [
				'methods' => 'POST',
				'callback' => [ __CLASS__, 'rest_create_notice' ],
				'permission_callback' => [ __CLASS__, 'rest_permission_check' ],
			]
        );

        register_rest_route(
            'blockera/v1',
            '/notices/(?P<id>[a-zA-Z0-9_-]+)',
            [
				'methods' => 'DELETE',
				'callback' => [ __CLASS__, 'rest_delete_notice' ],
				'permission_callback' => [ __CLASS__, 'rest_permission_check' ],
			]
        );

        register_rest_route(
            'blockera/v1',
            '/notices/(?P<id>[a-zA-Z0-9_-]+)/dismiss',
            [
				'methods' => 'POST',
				'callback' => [ __CLASS__, 'rest_dismiss_notice' ],
				'permission_callback' => [ __CLASS__, 'rest_permission_check' ],
			]
        );
    }

    /**
     * REST API permission check
     * 
     * @return bool
     */
    public static function rest_permission_check(): bool {
        return current_user_can('manage_options');
    }

    /**
     * REST API get notices
     * 
     * @param \WP_REST_Request $request Request object
     * @return \WP_REST_Response
     */
    public static function rest_get_notices( \WP_REST_Request $request): \WP_REST_Response {
        $notices = self::get_admin_notices();
        return rest_ensure_response($notices);
    }

    /**
     * REST API create notice
     * 
     * @param \WP_REST_Request $request Request object
     * @return \WP_REST_Response
     */
    public static function rest_create_notice( \WP_REST_Request $request): \WP_REST_Response {
        $notice    = $request->get_json_params();
        $notice_id = self::add_notice($notice);

        return rest_ensure_response(
            [
				'id' => $notice_id,
				'message' => 'Notice created successfully',
			]
        );
    }

    /**
     * REST API delete notice
     * 
     * @param \WP_REST_Request $request Request object
     * @return \WP_REST_Response
     */
    public static function rest_delete_notice( \WP_REST_Request $request): \WP_REST_Response {
        $notice_id = $request->get_param('id');
        $result    = self::remove_notice($notice_id);

        return rest_ensure_response(
            [
				'deleted' => $result,
				'message' => $result ? 'Notice deleted successfully' : 'Notice not found',
			]
        );
    }

    /**
     * REST API dismiss notice
     * 
     * @param \WP_REST_Request $request Request object
     * @return \WP_REST_Response
     */
    public static function rest_dismiss_notice( \WP_REST_Request $request): \WP_REST_Response {
        $notice_id = $request->get_param('id');
        $result    = self::dismiss_notice($notice_id);

        return rest_ensure_response(
            [
				'dismissed' => $result,
				'message' => 'Notice dismissed successfully',
			]
        );
    }

    /**
     * Add success notice
     * 
     * @param string $message Notice message
     * @param string $title Notice title
     * @param array  $options Notice options
     * @return string Notice ID
     */
    public static function add_success( string $message, string $title = '', array $options = []): string {
        return self::add_notice(
            array_merge(
                [
					'type' => 'success',
					'message' => $message,
					'title' => $title,
				],
                $options
            )
        );
    }

    /**
     * Add error notice
     * 
     * @param string $message Notice message
     * @param string $title Notice title
     * @param array  $options Notice options
     * @return string Notice ID
     */
    public static function add_error( string $message, string $title = '', array $options = []): string {
        return self::add_notice(
            array_merge(
                [
					'type' => 'error',
					'message' => $message,
					'title' => $title,
				],
                $options
            )
        );
    }

    /**
     * Add warning notice
     * 
     * @param string $message Notice message
     * @param string $title Notice title
     * @param array  $options Notice options
     * @return string Notice ID
     */
    public static function add_warning( string $message, string $title = '', array $options = []): string {
        return self::add_notice(
            array_merge(
                [
					'type' => 'warning',
					'message' => $message,
					'title' => $title,
				],
                $options
            )
        );
    }

    /**
     * Add info notice
     * 
     * @param string $message Notice message
     * @param string $title Notice title
     * @param array  $options Notice options
     * @return string Notice ID
     */
    public static function add_info( string $message, string $title = '', array $options = []): string {
        return self::add_notice(
            array_merge(
                [
					'type' => 'info',
					'message' => $message,
					'title' => $title,
				],
                $options
            )
        );
    }
}
