<?php

namespace Blockera\Pro\Providers;

use Blockera\Auth\Client;
use Blockera\Auth\Validator;
use Blockera\Pro\BlockeraPro;
use Blockera\Data\Cache\Cache;
use Blockera\Bootstrap\Application;
use Blockera\Auth\Upgrade\ProPlugin;
use Blockera\Auth\Config as AuthConfig;
use Blockera\Bootstrap\ServiceProvider;
use Blockera\Auth\Repositories\OptionRepository;
use League\OAuth2\Client\Provider\GenericProvider;
use Blockera\SiteBuilder\StyleEngine as SiteBuilderStyleEngine;

/**
 * Class AppServiceProvider for providing all application services.
 */
class AppServiceProvider extends ServiceProvider {

    /**
     * Registering services classes.
     *
     * @return void
     */
    public function register(): void {
        parent::register();

		global $blockera;

		if ($blockera) {

			$this->app->singleton(
				Cache::class,
				function ( Application $app, array $params = []) use ( $blockera) {

					return $blockera->make(Cache::class, $params);
				}
			);

			$blockera->singleton(
				SiteBuilderStyleEngine::class,
				function ( Application $app, array $params = []) use ( $blockera) {
					$style_engine = new SiteBuilderStyleEngine($params['block'], $params['fallbackSelector'], $params['isGlobalStyle'] ?? false);

					$style_engine->setApp($blockera);
					$style_engine->setBreakpoint(blockera_core_config('breakpoints.base'));
					$style_engine->setBreakpoints($app->getEntity('breakpoints'));

					return $style_engine;
				}
			);

			$this->registerSiteBuilderStyleEngine($blockera);
		}

        $this->app->singleton(
            Client::class,
            static function ( Application $app, array $args = []) {

                return new Client(new GenericProvider($args));
            }
        );

        $this->app->singleton(
            AuthConfig::class,
            function ( Application $app, array $config): AuthConfig {

                return new AuthConfig($config);
            }
        );

        $this->app->singleton(
            Validator::class,
            function ( Application $app, array $args) {
                return new Validator($app, $args['config']);
            }
        );

        $this->app->singleton(
            ProPlugin::class,
            function ( Application $app, array $args): ProPlugin {
                $plugin = array_intersect_key(
                    [
						'productName' => $args['config']->getProductName(),
						'pluginSlug' => $args['config']->getPluginSlug(),
					],
                    array_flip([ 'productName', 'pluginSlug' ])
                );

                $args['config']->setProductIdentifier($args['license']['productId']);
                $args['config']->setIsDev(blockera_core_config('app.debug'));
                $args['slug'] = $args['config']->getPluginSlug();
                $args['name'] = $args['config']->getPluginName();
                $args['id']   = $args['license']['id'];

                return new ProPlugin($app, $args);
            }
        );
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot(): void {
        parent::boot();

        add_action('init', [ $this, 'loadTextDomain' ]);

        $client_info       = OptionRepository::getOption();
        $auth_config_array = blockera_pro_core_config('auth');
        $config            = $this->app->make(AuthConfig::class, $auth_config_array);
        
		$config->setIcons([ blockera_pro_core_config('app.root_url') . '/assets/icon-256x256.png' ]);

        try {
            if (is_admin() && current_user_can('manage_options') && ! empty($client_info['licenses'])) {
                $licenses          = $client_info['licenses'];
                $products_licenses = array_column($licenses, 'productName');
                $license_index     = array_search($auth_config_array['productName'], $products_licenses, true);
                $license           = $licenses[ $license_index ];

                if ($license) {
                    $pro_plugin = $this->app->make(
                        ProPlugin::class,
                        [
							'config' => $config,
							'license' => $license,
                        ]
                    );

                    if ($this->app instanceof BlockeraPro) {
                        $this->app->setLicense($license);
                    }

                    $pro_plugin->applyHooks();
                }
            }
        } catch (\Exception $e) {
            wp_die(
                implode(
                    ', ',
                    [
                        'message' => $e->getMessage(),
                        'code' => $e->getCode(),
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                    ]
                )
            );
        }
    }

    /**
     * Loading text domain.
     *
     * @hooked `init`
     *
     * @return void
     */
    public function loadTextDomain(): void {
		wp_set_script_translations('@blockera/blockera-pro', 'blockera-pro');

        load_plugin_textdomain('blockera-pro', false, dirname(plugin_basename(BLOCKERA_PRO_FILE)) . '/languages');
    }

	/**
     * Registration Styles with Definitions.
     *
     * @return void
     */
    public function registerSiteBuilderStyleEngine( Application $app): void {
        $styleDefinitions = [
            'WebkitTextStrokeColor' => \Blockera\SiteBuilder\StyleDefinitions\WebkitTextStrokeColor::class,
            'WebkitTextStrokeWidth' => \Blockera\SiteBuilder\StyleDefinitions\WebkitTextStrokeWidth::class,
            'WordBreak' => \Blockera\SiteBuilder\StyleDefinitions\WordBreak::class,
            'WordSpacing' => \Blockera\SiteBuilder\StyleDefinitions\WordSpacing::class,
        ];

        foreach ($styleDefinitions as $key => $definition) {
			// Remove existing binding if it exists.
            if ($app->bound($key)) {
                $app->forgetInstance($key);
            }

            $app->singleton(
                $key,
                function ( Application $app, array $args) use ( $definition) {
                    return new $definition($args['supports']);
                }
            );
        }
    }
}
