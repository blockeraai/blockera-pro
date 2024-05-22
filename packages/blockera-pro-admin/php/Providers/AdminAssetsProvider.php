<?php

namespace Blockera\Pro\Admin\Providers;

use Blockera\Bootstrap\Application;
use Blockera\WordPress\AssetsLoader;
use Blockera\Pro\Providers\AssetProvider;
use Illuminate\Contracts\Container\BindingResolutionException;

/**
 * Class AssetsProvider providing all assets for admin side.
 *
 * @since 1.0.0
 */
class AdminAssetsProvider extends AssetProvider {

	/**
	 * Store loader identifier.
	 *
	 * @var string $id the loader identifier.
	 */
	protected string $id = 'blockera-pro-admin-assets-loader';

	/**
	 * Hold handler name.
	 *
	 * @var string $handler the handler name.
	 */
	protected string $handler = '@blockera/blockera-pro-admin';

	/**
	 * Register any application services.
	 *
	 * @return void
	 */
	public function register(): void {

		$this->app->bind(
			$this->id,
			function ( Application $app, array $args = [] ) {

				return new AssetsLoader(
					$app,
					$args['assets'],
					array_merge(
						[
							'id'         => $this->id,
							'root'       => [
								'url'  => blockera_pro_core_config( 'app.root_url' ),
								'path' => blockera_pro_core_config( 'app.root_path' ),
							],
							'debug-mode' => blockera_pro_core_config( 'app.debug' ),
						],
						$args['extra-args']
					)
				);
			}
		);
	}

	/**
	 * Bootstrap any application services.
	 *
	 * @throws BindingResolutionException Binding resolution exception error handle.
	 * @return void
	 */
	public function boot(): void {

		$this->app->make(
			$this->id,
			[
				'assets'     => blockera_pro_core_config( 'assets.admin.list' ),
				'extra-args' => [
					'id'                   => $this->id,
					'enqueue-admin-assets' => true,
					'packages-deps'        => blockera_pro_core_config( 'assets.admin.with-deps' ),
				],
			]
		);
	}

	/**
	 * Retrieve handler name.
	 *
	 * @return string
	 */
	public function getHandler(): string {

		return $this->handler;
	}

}
