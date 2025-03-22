<?php

namespace Blockera\Pro\Admin\Providers;

use Blockera\Auth\Client;
use Blockera\Bootstrap\AssetsProvider;
use Blockera\Auth\Repositories\OptionRepository;

/**
 * Class AssetsProvider providing all assets for admin side.
 *
 * @since 1.0.0
 */
class BlockeraProAdminAssetsProvider extends AssetsProvider {

    /**
     * The bootstrap method.
     *
     * @return void
     */
    public function boot(): void
    {
		// Skip execution if saving in site editor.
		if (blockera_is_skip_request()) {
			return;
		}

        if (empty($_REQUEST['page']) || false === strpos($_REQUEST['page'], 'blockera-settings')) {
            return;
        }

        add_filter('blockera/wordpress/' . $this->getId() . '/handle/inline-script', [ $this, 'getHandler' ]);
        add_filter('blockera/wordpress/' . $this->getId() . '/inline-script/before', [ $this, 'authorizationInlineScript' ]);

        $this->app->make(
            $this->getId(),
            [
                'assets'     => $this->getAssets(),
                'extra-args' => [
                    'fallback' => [
                        'url' => $this->getURL(),
                        'path' => $this->getPATH(),
                    ],
                    'enqueue-admin-assets' => true,
                    'id' => $this->getId(),
                    'packages-deps' => [
                        '@blockera/utils',
                        '@blockera/classnames',
                        '@blockera/icons',
                        '@blockera/data',
                        '@blockera/data-editor',
                        '@blockera/env',
                        '@blockera/controls',
                    ],
                ],
            ]
        );
    }

    /**
     * Store loader identifier.
     *
     * @var string $id the loader identifier.
     */
    public function getId(): string
    {
        return 'blockera-pro-admin-assets-loader';
    }

    /**
     * Blockera pro handler name.
     *
     * @return string
     */
    public function getHandler(): string
    {
        return '@blockera/blockera-pro-admin';
    }

    /**
     * Authorization inline scripts.
     *
     * @param string $inline_script the inline unfiltered js script.
     *
     * @return string the filtered inline js script.
     */
    public function authorizationInlineScript( string $inline_script): string
    {
        $client_info = OptionRepository::getOption();
        $license = OptionRepository::getLicense($client_info);
        $is_activated_pro = !empty($license) && 'active' === ( $license['status'] ?? 'expired' );

        $account_info = array_merge(
            [ 'product_id' => blockera_pro_core_config('auth.productName') ],
            $client_info,
        );

		global $blockera_pro;

        $client = $blockera_pro->make(
            Client::class,
            [
				//phpcs:disable
                /*
                |--------------------------------------------------------------------------
                | Client ID
                |--------------------------------------------------------------------------
                |
                | The client ID is the unique identifier for the application.
                |
                */
                'clientId'                => $client_info['client_id'] ?? $_GET['client_id'] ?? '',

                /*
                |--------------------------------------------------------------------------
                | Client Secret
                |--------------------------------------------------------------------------
                |
                | The client secret is the secret key for the application.
                |
                */
                'clientSecret'            => $client_info['client_secret'] ?? $_GET['client_secret'] ?? '',

                /*
                |--------------------------------------------------------------------------
                | Authorize
                |--------------------------------------------------------------------------
                |
                | The authorize endpoint is used to initiate the OAuth2 authorization flow.
                | When users connect their Blockera account, they are redirected to this URL
                | to authenticate and grant access permissions to the application.
                |
                */
                'urlAuthorize'            => $_ENV['CONNECT_ACCOUNT_URL'] ?? 'https://api.blockera.ai/authorize',

                /*
                |--------------------------------------------------------------------------
                | Get Access Token
                |--------------------------------------------------------------------------
                |
                | The get access token endpoint is used to retrieve the access token for the user.
                |
                */
                'urlAccessToken'          => $_ENV['ACCESS_TOKEN_URL'] ?? 'https://api.blockera.ai/auth/v1/access-token',

                /*
                |--------------------------------------------------------------------------
                | Resource Owner Details
                |--------------------------------------------------------------------------
                |
                | The resource owner details endpoint is used to retrieve detailed information
                | about the user's account, including subscription status and other relevant data.
                |
                */
                'urlResourceOwnerDetails' => $_ENV['RESOURCE_OWNER_DETAILS_URL'] ?? 'https://api.blockera.ai/files/v1/download',

                /*
                |--------------------------------------------------------------------------
                | Redirect URI
                |--------------------------------------------------------------------------
                |
                | The redirect URI is the URL where the user will be redirected after
                | the OAuth2 authorization flow is complete.
                |
                */
                'redirectUri'             => admin_url('admin.php?page=blockera-settings-account'),
            ]
        );

		//phpcs:enable

        $client->auth($client_info);
		
        return $inline_script . 'window.blockeraPROIsActivated = ' . ( $is_activated_pro ? 'true' : 'false' ) . ';
				window.blockeraActivateUrl = "' . $client->getProvider()->getAuthorizationUrl() . '";
				window.blockeraConnectActionNonce = "' . wp_create_nonce('blockera-connect-with-your-account') . '";
				window.blockeraAIAccount = ' . wp_json_encode($account_info) . ';
				window.wpCreatePageUrl = "' . admin_url('/post-new.php?post_type=page') . '";
				window.blockeraActivateLicenseUrl = "' . admin_url('admin.php?page=blockera-settings-account') . '";
				window.blockeraIsConnectedWithYourAccount = "' . ( isset($_GET['registered-client'], $_GET['connectedWithYourAccount']) ? 'true' : 'false' ) . '";';
    }

    /**
     * The assets to load.
     *
     * @return array the assets to load.
     */
    protected function getAssets(): array
    {
        return array_merge(
            [
                'auth-pro',
                'auth-pro-styles',
                'blockera-pro-admin',
                'blockera-pro-styles',
            ],
            parent::getAssets()
        );
    }

    /**
     * @return string the blockera pro plugin root URL.
     */
    protected function getURL(): string
    {
        return blockera_pro_core_config('app.root_url');
    }

    /**
     * @return string the blockera pro plugin root PATH.
     */
    protected function getPATH(): string
    {
        return blockera_pro_core_config('app.root_path');
    }

	/**
	 * @return bool the blockera pro plugin debug mode.
	 */
	protected function getDebugMode(): bool {

		return blockera_pro_core_config( 'app.debug' );
	}
}
