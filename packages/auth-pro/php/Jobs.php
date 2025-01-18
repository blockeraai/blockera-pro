<?php

namespace Blockera\Auth;

use Blockera\WordPress\Sender;

class Jobs {

    /**
     * @var Sender $sender the sender instance.
     */
    protected Sender $sender;

    /**
     * @var Config $config the config instance.
     */
    protected Config $config;

    /**
     * The option key.
     *
     * @var string $optionKey The option key.
     */
    protected string $option_key_suffix = '_do_activation_redirect';

    /**
     * @param Sender $sender      the sender instance.
     * @param string $plugin_file the plugin main file path.
     * @param array  $config the config array.
     */
    public function __construct( Sender $sender, string $plugin_file, array $config) {
        $this->sender = $sender;
        $this->config = new Config($config);

        add_filter('cron_schedules', [ $this, 'addCronInterval' ]);
        add_action('blockera_pro_each_per_day', [ $this, 'heartbeat' ]);
        add_action('blockera_pro_each_per_ten_days', [ $this, 'doRefreshToken' ]);

        register_activation_hook($plugin_file, [ $this, 'activationHook' ]);
        register_deactivation_hook($plugin_file, [ $this, 'deactivationHook' ]);
    }

    /**
     * Add the 1 day schedule on stack.
     *
     * @param array $schedules The schedules array.
     *
     * @return array the new schedules array.
     */
    public function addCronInterval( array $schedules): array
    {
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

    /**
     * Do refresh token process every 10 days.
     *
     * @return void
     */
    public function doRefreshToken(): void
    {
        $clientInfo = $this->config->getClientInfo();

        $response = wp_remote_post(
            $this->config->getRefreshTokenUrl(),
            [
				'timeout' => 10,
				'sslverify' => false,
				'headers' => [
					'Authorization' => 'Bearer ' . $clientInfo['access_token'],
				],
				'body' => [
					'scope' => 'read',
					'grant_type' => 'refresh_token',
					'client_id' => $clientInfo['client_id'],
					'refresh_token' => $clientInfo['refresh_token'],
					'client_secret' => $clientInfo['client_secret'],
				],
			]
        );

        if (is_wp_error($response)) {
            return;
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);

        if (!isset($data['access_token'])) {
            return;
        }

        update_option(
            Config::getOptionKey(),
            array_merge(
                get_option(Config::getOptionKey()),
                [
					'expires'       => $data['expires_in'] ?? '',
					'access_token'  => $data['access_token'] ?? '',
					'has_expired'   => false,
					'refresh_token' => $data['refresh_token'] ?? '',
                ]
            )
        );
    }

    /**
     * Do heartbeat process every 1 day.
     *
     * @return void
     */
    public function heartbeat(): void
    {
        $client_info = $this->config->getClientInfo();
        $license = $this->config->getLicense($client_info);

        if (empty($license)) {
            return;
        }

        $args = [
            'timeout'     => 30,
            'redirection' => 5,
            'httpversion' => '1.1',
            // Disable SSL verification.
            'sslverify'   => false,
            'headers'     => [
                'Content-Type'  => 'application/json',
                'Authorization' => 'Bearer ' . $client_info['access_token'],
            ],
            'body'        => [
                'domain'     => home_url(),
                'client_id'  => $client_info['client_id'],
                'user_email' => wp_get_current_user()->user_email,
            ],
        ];

        $response = wp_remote_get(Config::getAccountInfoLink(), $args);

        if (is_wp_error($response)) {
            return;
        }

        $response_body = json_decode(wp_remote_retrieve_body($response), true);

		// phpcs:ignore
        if (empty($response_body['success']) || false == $response_body['success'] || empty($response_body['data']['licenses'])) {
            return;
        }

        $mapped_received_licenses = [];

        foreach ($response_body['data']['licenses'] as $key => $received_license) {
            unset($received_license['versionId']);

            $mapped_received_licenses[ $key ] = $received_license;
        }

        $license_index = array_search($license, $mapped_received_licenses, true);

        if (false === $license_index) {
            delete_option(Config::getOptionKey());
        }

        if (isset($mapped_received_licenses[ $license_index ]['isEnabled']) && true === $mapped_received_licenses[ $license_index ]['isEnabled']) {
            update_option(Config::getOptionKey(), $mapped_received_licenses);
        }
    }

    /**
     * Activation plugin hook.
     *
     * @return void
     */
    public function activationHook(): void
    {
        if (! wp_next_scheduled('blockera_pro_each_per_day')) {

            wp_schedule_event(time(), 'blockera_pro_1_day', 'blockera_pro_each_per_day');
        }

        if (! wp_next_scheduled('blockera_pro_each_per_ten_days')) {

            wp_schedule_event(time(), 'blockera_pro_10_days', 'blockera_pro_each_per_ten_days');
        }

        add_option($this->config::getOptionKey() . $this->option_key_suffix, true);
    }

    /**
     * Deactivation plugin hook.
     *
     * @return void
     */
    public function deactivationHook(): void
    {
        wp_clear_scheduled_hook('blockera_pro_each_per_day');
    }

    /**
     * Redirecting your WordPress admin to your plugin activation page after activation it.
     *
     * @return void
     */
    public function redirectToActivationPage(): void
    {
        $optionKey = $this->config::getOptionKey() . $this->option_key_suffix;

        // Check if the redirect flag is set and the user has sufficient permissions.
        if (get_option($optionKey, false)) {

            delete_option($optionKey);

            if (is_admin() && current_user_can('activate_plugins')) {

                // Redirect to plugin account page to activate the plugin.
                wp_redirect(admin_url('admin.php?page=blockera-settings-account'));
                exit;
            }
        }
    }
}
