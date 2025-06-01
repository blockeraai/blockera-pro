<?php

namespace Blockera\Auth;

use Blockera\WordPress\Sender;
use Blockera\Auth\Repositories\OptionRepository;

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
     * @param array  $config the config array.
     */
    public function __construct( Sender $sender, array $config) {
        $this->sender = $sender;
        $this->config = new Config($config);

        add_action('blockera_pro_each_per_day', [ $this, 'verifyLicenseStatus' ]);
        add_action('blockera_pro_each_per_ten_days', [ $this, 'doRefreshToken' ]);
    }

    /**
     * Do refresh token process every 10 days.
     *
     * @return void
     */
    public function doRefreshToken(): void {
        $clientInfo = OptionRepository::getOption();

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

        if (! isset($data['access_token'])) {
            return;
        }

		OptionRepository::setOption(
			array_merge(
                $clientInfo,
                [
					'has_expired'   => false,
					'expires'       => $data['expires_in'] ?? '',
					'access_token'  => $data['access_token'] ?? '',
					'refresh_token' => $data['refresh_token'] ?? '',
                ]
            )
		);
    }

    /**
     * Verify license status and update local license data every 1 day.
     *
     * @return void
     */
    public function verifyLicenseStatus(): void {
        $client_info = OptionRepository::getOption();
        $license     = OptionRepository::getLicense($client_info);

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
			blockera_auth_pro_cleanup_auth_data(OptionRepository::getOptionKey());

            return;
        }

        $mapped_received_licenses = [];

        foreach ($response_body['data']['licenses'] as $key => $received_license) {
            unset($received_license['versionId']);

            $mapped_received_licenses[ $key ] = $received_license;
        }

        $license_index = array_search($license, $mapped_received_licenses, true);

        if (false === $license_index) {
			blockera_auth_pro_cleanup_auth_data(OptionRepository::getOptionKey());
        }

        if (isset($mapped_received_licenses[ $license_index ]['isEnabled']) && true === $mapped_received_licenses[ $license_index ]['isEnabled']) {
            OptionRepository::setOption($mapped_received_licenses);
        }
    }
}
