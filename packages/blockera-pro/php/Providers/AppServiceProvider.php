<?php

namespace Blockera\Pro\Providers;

use Blockera\Auth\Client;
use Blockera\Auth\Validator;
use Blockera\Pro\BlockeraPro;
use Blockera\Bootstrap\Application;
use Blockera\Auth\Upgrade\ProPlugin;
use Blockera\Auth\Config as AuthConfig;
use Blockera\Auth\Upgrade\NoticeIssuer;
use Blockera\Bootstrap\ServiceProvider;

/**
 * Class AppServiceProvider for providing all application services.
 */
class AppServiceProvider extends ServiceProvider {

    /**
     * Registering services classes.
     *
     * @return void
     */
    public function register(): void
    {
        parent::register();

        $this->app->singleton(
            Client::class,
            static function ( Application $app, array $args = []) {

                return new Client($args);
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
                return new Validator($app, $args);
            }
        );

        $this->app->singleton(
            NoticeIssuer::class,
            function ( Application $app, array $args) {
                return new NoticeIssuer($app, $args);
            }
        );

        $this->app->singleton(
            ProPlugin::class,
            function ( Application $app, array $args): ProPlugin {
                $plugin = array_intersect_key($args['config'], array_flip([ 'productName', 'pluginSlug' ]));

                $auth_config = $app->make(AuthConfig::class, $args['config'] ?? []);
                $auth_config->setProductIdentifier($args['license']['productId']);
                $auth_config->setIsDev(blockera_core_config('app.debug'));

                $app->make(
                    NoticeIssuer::class,
                    [
                        'plugin' => $plugin,
                        'subscription' => $args['license']['name'] ?? '',
                    ]
                );

                unset($args['config']);
                $args['slug'] = $auth_config->getPluginSlug();
                $args['name'] = $auth_config->getPluginName();
                $args['id'] = $args['license']['id'];

                return new ProPlugin($app, $args);
            }
        );
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot(): void
    {
        parent::boot();

        add_action('init', [ $this, 'loadTextDomain' ]);

        $auth_config_array = blockera_pro_core_config('auth');
        $client_info = get_option(AuthConfig::getOptionKey());
        $config = $this->app->make(AuthConfig::class, $auth_config_array);

        // FIXME: This is a temporary solution to set the plugin icon.
        $config->setIcons([ blockera_pro_core_config('app.root_url') . '/.wordpress-org/icon-256x256.png' ]);

        try {
            if (is_admin() && current_user_can('manage_options') && ! empty($client_info['licenses'])) {
                $licenses = $client_info['licenses'];
                $products_licenses = array_column($licenses, 'productName');
                $license_index = array_search($auth_config_array['productName'], $products_licenses, true);
                $license = $licenses[ $license_index ];

                if ($license) {
                    $pro_plugin = $this->app->make(
                        ProPlugin::class,
                        [
                            'config' => $auth_config_array,
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
    public function loadTextDomain(): void
    {
		wp_set_script_translations('@blockera/blockera-pro', 'blockera-pro');

        load_plugin_textdomain('blockera-pro', false, dirname(plugin_basename(BLOCKERA_PRO_FILE)) . '/languages');
    }
}
