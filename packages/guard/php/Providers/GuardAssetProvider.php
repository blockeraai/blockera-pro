<?php

namespace Blockera\Guard\Providers;

use Illuminate\Contracts\Container\BindingResolutionException;

/**
 * Class GuardAssetProvider providing all assets for guard.
 *
 * @since 1.0.0
 */
class GuardAssetProvider extends \Blockera\Bootstrap\AssetsProvider {

	/**
	 * Store the loader identifier.
	 *
	 * @return string the loader identifier.
	 */
	public function getId(): string {
		return 'guard';
	}

	/**
	 * Store the handler name.
	 *
	 * @return string the handler name.
	 */
	public function getHandler(): string {
		return '@blockera/guard';
	}

	/**
	 * Bootstrap any application services.
	 *
	 * @throws BindingResolutionException Binding resolution exception error handle.
	 * @return void
	 */
	public function boot(): void {
		add_filter('blockera/wordpress/' . $this->getId() . '/handle/inline-script', [ $this, 'getHandler' ]);

		$this->app->make(
			$this->getId(),
			[
				'assets' => $this->getAssets(),
				'extra-args' => [
					'fallback' => [
						'url'  => $this->getURL(),
						'path' => $this->getPATH(),
					],
					'packages-deps' => [
						'@blockera/feature-manager' => [
							'@blockera/blockera',
						],
					],
					'enqueue-block-assets' => true,
				],
			]
		);
	}

	/**
	 * Get the plugin's root directory URL.
	 *
	 * @return string
	 */
	protected function getURL(): string {
		return blockera_pro_core_config('app.root_url');
	}

	/**
	 * Get the plugin's root directory path.
	 *
	 * @return string
	 */
	protected function getPath(): string {
		return blockera_pro_core_config('app.root_path');
	}

	/**
	 * @return bool the blockera pro plugin debug mode.
	 */
	protected function getDebugMode(): bool {

		return blockera_pro_core_config( 'app.debug' );
	}

	/**
	 * Get all assets of blockera plugin.
	 *
	 * @return array the assets list to load on page.
	 */
	protected function getAssets(): array {
		return [
			'feature-manager',
		];
	}
}
