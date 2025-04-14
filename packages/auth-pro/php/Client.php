<?php

namespace Blockera\Auth;

use Blockera\Utils\Utils;
use Blockera\Exceptions\BaseException;
use Blockera\Auth\Config as AuthConfig;
use Blockera\Auth\Repositories\OptionRepository;
use League\OAuth2\Client\Provider\GenericProvider;

class Client {

    /**
     * OAuth2 provider instance for handling authentication.
     *
     * @var GenericProvider
     */
    private GenericProvider $provider;

	/**
	 * The constructor.
	 *
	 * @param GenericProvider $provider The provider instance.
	 */
    public function __construct( GenericProvider $provider) {
        $this->provider = $provider;
    }

    /**
     * Process authorization information from OAuth callback.
     * Handles authorization code exchange for access token and validates state parameter.
     *
     * @param array $client_info The client information.
     *
     * @return void
     */
    public function auth( array $client_info): void
    {
        $license = OptionRepository::getLicense($client_info);

        if (isset($license['status']) && 'active' !== $license['status']) {
            return;
        }

		if (isset($_GET['registered-client'], $_GET['connectedWithYourAccount']) && 'true' === $_GET['registered-client'] && 'true' === $_GET['connectedWithYourAccount']) {
            $this->save();

            return;
        }

        if (! isset($_GET['client_id'], $_GET['client_secret'], $_GET['redirect_to'])) {
            return;
        }

        $allowed_redirect_to = false;

        try {
            if (empty($client_info['access_token'])) {
                // Prevent to duplicate create account request.
                $this->createClientInfo();
                $this->connectToClientAccount();

                // phpcs:disable
                // Using the access token, we may look up details about the
                // resource owner.
                // $resourceOwner = $this->provider->getResourceOwner($access_token);

                // dd($resourceOwner->toArray());

                // // The provider provides a way to get an authenticated API request for
                // // the service, using the access token; it returns an object conforming
                // // to Psr\Http\Message\RequestInterface.
                // $request = $this->provider->getAuthenticatedRequest(
                // 'GET',
                // 'https://service.example.com/resource',
                // $access_token
                // );
            }

            $allowed_redirect_to = true;
        } catch (\League\OAuth2\Client\Provider\Exception\IdentityProviderException | BaseException $e) {
            // Failed to get the access token or user details.
             wp_die($e->getMessage());
        }

        if ($allowed_redirect_to) {
            $parsed_url   = parse_url($_GET['redirect_to']);
            $parsed_query = [];
            parse_str($parsed_url['query'] ?? '', $parsed_query);

			$parsed_query['authorized'] = true;
			$parsed_query['product'] = Config::getProductName();
            $parsed_query['client_id']     = $_GET['client_id'];
            $parsed_query['client_secret'] = $_GET['client_secret'];

            $parsed_url['query'] = http_build_query($parsed_query);
            $_GET['redirect_to'] = $parsed_url['scheme'] . '://' . $parsed_url['host'] . $parsed_url['path'] . '?' . $parsed_url['query'];

            echo '<script>window.location.href = "' . $_GET['redirect_to'] . '"</script>';
            exit;
        }
    }

    /**
     * Get the OAuth2 provider instance.
     *
     * @return GenericProvider
     */
    public function getProvider(): GenericProvider
    {
        return $this->provider;
    }

    /**
     * Creates client information by making a REST API request to create an account.
     *
     * @return void
     */
    protected function createClientInfo(): void
    {
        $create_account_request = new \WP_REST_Request('POST', '/blockera/v1/auth/create-account');
        $create_account_request->set_body_params(
            [
                'code' => $_GET['code'],
                'action' => 'create_account',
                'client_id'     => $_GET['client_id'],
                'client_secret' => $_GET['client_secret'],
            ]
        );
        $create_account_request->set_header('X-Blockera-Nonce', wp_create_nonce('blockera-connect-with-your-account'));

        $response_object = rest_do_request($create_account_request);

        if ($response_object->is_error()) {

            $data = $response_object->get_data();

            throw new BaseException(!empty($data['errors']) ? implode(', ', $data['errors']) : 'Rest No Route', 500);
        }
    }

    /**
     * Connects to a client account by exchanging an authorization code for an access token and making a REST API request.
     *
     * @return void
     */
    protected function connectToClientAccount(): void
    {
        // Try to get an access token using the authorization code grant.
        $access_token = $this->getProvider()->getAccessToken(
            'authorization_code',
            [
                'code' => $_GET['code'],
            ]
        );

        $connect_account_request = new \WP_REST_Request('POST', '/blockera/v1/auth/connect-account');
        $connect_account_request->set_body_params([
            'action' => 'connect_account',
            'expires' => $access_token->getExpires(),
            'token' => $access_token->getToken(),
            'has_expired' => $access_token->hasExpired(),
            'refresh_token' => $access_token->getRefreshToken(),
        ]);
        $connect_account_request->set_header('X-Blockera-Nonce', wp_create_nonce('blockera-connect-with-your-account'));

        $response_object = rest_do_request($connect_account_request);

        if ($response_object->is_error()) {

            $data = $response_object->get_data();

            throw new BaseException(!empty($data['errors']) ? implode(', ', $data['errors']) : 'Rest No Route', 500);
        }
    }

    /**
     * Save the current client state on database.
     *
     * @return array the saved client information.
     */
    public function save(): array
    {
        $client_info = OptionRepository::getOption();

        if (empty($client_info['access_token']) && empty($client_info['licenses'])) {
            echo '<script>window.location.href = "' . admin_url('admin.php?page=blockera-settings-account') . '"</script>';
            exit;
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

        $response = wp_remote_get(AuthConfig::getAccountInfoLink(), $args);

        if (is_wp_error($response)) {
            throw new BaseException($response->get_error_message(), 500);
        }

        $response_body = json_decode(wp_remote_retrieve_body($response), true);

        if (! empty($response_body['data']['success']) && false === $response_body['data']['success']) {
            throw new BaseException(implode(', ', $response_body['data']['errors']), 500);
        }

        if (isset($response_body['data']['errors'])) {
            throw new BaseException(implode(', ', $response_body['data']['errors']), 500);
        }

        $licenses = array_map(
            function ($license) {
				OptionRepository::setTransient(Utils::snakeCase(explode('- ', $license['name'])[2]), $license['versionId'], 60 * 60 * 3); // Available for 3 hours.

                unset($license['versionId']);

                return $license;
            },
            $response_body['data']['licenses']
        );

        unset($response_body['data']['licenses']);

        if (! $client_info) {

            $info                  = $response_body['data'];
            $info['licenses'] = $licenses;
        } else {

            $info                  = array_merge($client_info, $response_body['data']);
            $info['licenses'] = $licenses;
        }

		OptionRepository::setOption($info);

        return $info;
    }
}
