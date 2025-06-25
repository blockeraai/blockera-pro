<?php

namespace Blockera\Auth\Http\Controllers;

use Blockera\Http\RestController;
use Blockera\Auth\Repositories\OptionRepository;

class ConnectionController extends RestController {

	/**
	 * Store validation errors.
	 *
	 * @var array
	 */
	protected $errors = [];

	/**
	 * Check if the user has permission to access the resource.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return bool Whether the user has permission.
	 */
	public function permission( \WP_REST_Request $request): bool {

		if ('/blockera/v1/auth/clear-licenses' === $request->get_route()) {
			return true;
		}

		if (! current_user_can('manage_options')) {
			return false;
		}

		return wp_verify_nonce($request->get_header('X-Blockera-Nonce'), 'blockera-connect-with-your-account');
	}

	/**
	 * Connect to Blockera AI.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response The response object.
	 */
	public function connectAccount( \WP_REST_Request $request): \WP_REST_Response {
		$this->validate($request->get_params());

		if (count($this->errors) > 0) {
			return new \WP_REST_Response(
				[
					'code'    => 400,
					'success' => false,
					'errors'  => $this->errors,
				],
				400
			);
		}

		$client_info = OptionRepository::getOption();

		if (! $client_info) {

			$info = [
				'expires'       => $request->get_param('expires'),
				'access_token'  => $request->get_param('token'),
				'has_expired'   => $request->get_param('has_expired'),
				'refresh_token' => $request->get_param('refresh_token'),
			];
		} else {

			$info = array_merge(
				$client_info,
				[
					'expires'       => $request->get_param('expires'),
					'access_token'  => $request->get_param('token'),
					'has_expired'   => $request->get_param('has_expired'),
					'refresh_token' => $request->get_param('refresh_token'),
				]
			);
		}

		$updated = OptionRepository::setOption($info);

		if (! $updated && $info === $client_info) {
			return new \WP_REST_Response(
				[
					'code'    => 500,
					'success' => false,
					'errors'  => [
						__('Failed to connect to Blockera AI.', 'blockera-pro'),
					],
				],
				500
			);
		}

		return new \WP_REST_Response(
			[
				'code'    => 200,
				'success' => true,
				'data'    => [
					'message' => __('Connected to Blockera AI successfully.', 'blockera-pro'),
				],
			]
		);
	}

	/**
	 * Create an account.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response The response object.
	 */
	public function createAccount( \WP_REST_Request $request): \WP_REST_Response {
		$this->validate($request->get_params());

		if (count($this->errors) > 0) {
			return new \WP_REST_Response(
				[
					'code'    => 400,
					'success' => false,
					'errors'  => $this->errors,
				],
				400
			);
		}

		$client_info = OptionRepository::getOption();

		if (! $client_info) {

			$info = [
				'authorization_code' => $request->get_param('code'),
				'client_id'          => $request->get_param('client_id'),
				'client_secret'      => $request->get_param('client_secret'),
			];
		} else {

			$info = array_merge(
				$client_info,
				[
					'authorization_code' => $request->get_param('code'),
					'client_id'          => $request->get_param('client_id'),
					'client_secret'      => $request->get_param('client_secret'),
				]
			);
		}

		$updated = OptionRepository::setOption($info);

		if (! $updated && $client_info !== $info) {
			return new \WP_REST_Response(
				[
					'code'    => 500,
					'success' => false,
					'errors'  => [
						__('Failed to create client info.', 'blockera-pro'),
					],
				],
				500
			);
		}

		return new \WP_REST_Response(
			[
				'code'    => 201,
				'success' => true,
				'data'    => [
					'message' => __('Client info created successfully.', 'blockera-pro'),
				],
			],
			201
		);
	}

	/**
	 * Check if the user is connected to https://blockera.ai bought subscription.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response The response object.
	 */
	public function isConnected( \WP_REST_Request $request): \WP_REST_Response {
		$this->validate($request->get_params());

		$client_info = OptionRepository::getOption();

		if (empty($client_info['access_token'])) {

			$this->errors['access_token'] = __('Access token is required.', 'blockera-pro');
		} elseif (time() > $client_info['expires']) {

			$this->errors['access_token'] = __('Access token has expired.', 'blockera-pro');
		}

		if (count($this->errors) > 0) {
			return new \WP_REST_Response(
				[
					'code'    => 400,
					'success' => false,
					'errors'  => $this->errors,
				],
				400
			);
		}

		if (! $client_info) {

			$info = [
				'is_connected' => (bool) $request->get_param('is_connected'),
			];
		} else {

			$info = array_merge(
				$client_info,
				[
					'is_connected' => (bool) $request->get_param('is_connected'),
				]
			);
		}

		$updated = OptionRepository::setOption($info);

		if (! $updated && $client_info !== $info) {
			$this->errors['update_failed'] = __('Failed to update connection status.', 'blockera-pro');

			return new \WP_REST_Response(
				[
					'code'    => 500,
					'success' => false,
					'errors'  => $this->errors,
				],
				500
			);
		}

		return new \WP_REST_Response(
			[
				'code'    => 200,
				'success' => true,
				'data'    => [
					'is-connected' => $info['is_connected'],
				],
			]
		);
	}

	/**
	 * Get the licenses information.
	 *
	 * @param \WP_REST_Request $request The request object.
	 *
	 * @return \WP_REST_Response The response object.
	 */
	public function getLicenses( \WP_REST_Request $request): \WP_REST_Response {

		if ('licenses' !== $request->get_param('action')) {
			$this->errors['invalid_action'] = __('Invalid action.', 'blockera-pro');
		}

		$this->validate($request->get_params());

		if (count($this->errors) > 0) {
			return new \WP_REST_Response(
				[
					'code'    => 400,
					'success' => false,
					'errors'  => $this->errors,
				],
				400
			);
		}

		$client_info = OptionRepository::getOption();

		if (! empty($client_info['licenses'])) {
			$account_info = [
				'name'   => $client_info['name'] ?? '',
				'email'  => $client_info['email'] ?? '',
				'avatar' => $client_info['avatar'] ?? '',
				'licenses' => $client_info['licenses'] ?? [],
			];

			return new \WP_REST_Response(
				[
					'code'    => 200,
					'success' => true,
					'data'    => $account_info,
				]
			);
		}

		return new \WP_REST_Response(
			[
				'code'    => 400,
				'success' => false,
				'errors'  => [
					'access_token' => __('Access token is required.', 'blockera-pro'),
				],
			],
			400
		);
	}

	/**
	 * Validate the request parameters.
	 *
	 * @param array $params The request parameters.
	 *
	 * @return void
	 */
	protected function validate( array $params): void {
		if (empty($params['action'])) {
			$this->errors['action'] = __('Action Field is required.', 'blockera-pro');

			return;
		}

		$action = sanitize_text_field($params['action']);

		$required_params = [
			'action' => __('Action Field is required.', 'blockera-pro'),
		];

		if ('create_account' === $action) {
			$required_params['client_id']     = __('Client ID Field is required.', 'blockera-pro');
			$required_params['code']          = __('Authorization Code Field is required.', 'blockera-pro');
			$required_params['client_secret'] = __('Client Secret Field is required.', 'blockera-pro');
		} elseif ('connect_account' === $action) {
			$required_params['token']         = __('Access Token Field is required.', 'blockera-pro');
			$required_params['expires']       = __('Expires Field is required.', 'blockera-pro');
			$required_params['has_expired']   = __('Has Expired Field is required.', 'blockera-pro');
			$required_params['refresh_token'] = __('Refresh Access Token Field is required.', 'blockera-pro');
		}

		$available_actions = [
			'licenses',
			'unsubscribe',
			'is_connected',
			'create_account',
			'connect_account',
		];

		if (! in_array($action, $available_actions, true)) {
			$this->errors['invalid_action'] = __('Invalid action.', 'blockera-pro');
		}

		// Validate and sanitize parameters.
		foreach ($params as $key => $value) {
			if (is_string($value)) {
				$params[ $key ] = sanitize_text_field($value);
			}
		}

		array_map(
			function ( $message, $param) use ( $params) {
				if ('has_expired' === $param && false === $params[ $param ]) {
					return;
				}
				if (empty($params[ $param ])) {
					$this->errors[ $param ] = $message;
				}
			},
			$required_params,
			array_keys($required_params)
		);
	}

	/**
	 * Clear the licenses information.
	 * usually used when the user is blockerabot account.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * 
	 * @return \WP_REST_Response The response object.
	 */
	public function clearLicenses( \WP_REST_Request $request): \WP_REST_Response {
		
		if ( 'development' !== $_ENV['APP_MODE'] && 'blockeraai+githubbot@gmail.com' !== $request->get_param('email')) {
			return new \WP_REST_Response(
				[
					'success' => false,
					'errors'  => [
						__('You are not authorized to clear licenses.', 'blockera-pro'),
					],
				],
				403
			);
		}

		return new \WP_REST_Response(
			[
				'success' => blockera_auth_pro_cleanup_auth_data(OptionRepository::getOptionKey()),
			], 
			200
		);
	}
}
