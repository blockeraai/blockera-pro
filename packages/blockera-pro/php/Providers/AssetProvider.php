<?php

namespace Blockera\Pro\Providers;

use Blockera\Bootstrap\Application;
use Blockera\Setup\Providers\AssetsProvider;
use Blockera\WordPress\AssetsLoader;
use Illuminate\Contracts\Container\BindingResolutionException;

/**
 * Class AssetsProvider providing all assets.
 *
 * @since 1.0.0
 */
class AssetProvider extends AssetsProvider {

	/**
	 * Store loader identifier.
	 *
	 * @var string $id the loader identifier.
	 */
	protected string $id = 'blockera-pro-assets-loader';

	/**
	 * Hold handler name.
	 *
	 * @var string $handler the handler name.
	 */
	protected string $handler = '@blockera/blockera-pro';

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
				'assets'     => blockera_pro_core_config( 'assets.editor.list' ),
				'extra-args' => [
					'id'                   => $this->id,
					'dequeue-stack'        => blockera_pro_core_config( 'assets.editor.dequeue' ),
					'enqueue-block-assets' => true,
					'packages-deps'        => blockera_pro_core_config( 'assets.editor.with-deps' ),
					'root'                 => [
						'url'  => blockera_pro_core_config( 'app.root_url' ),
						'path' => blockera_pro_core_config( 'app.root_path' ),
					],
					'debug-mode'           => blockera_pro_core_config( 'app.debug' ),
				],
			]
		);

		add_action( 'admin_enqueue_scripts', [ $this, 'l10n' ], 9e2 );
	}

	/**
	 * Retrieve handler name.
	 *
	 * @return string
	 */
	public function getHandler(): string {

		return $this->handler;
	}

	public function l10n(): void {

		$userRoles = blockera_normalized_user_roles();

		wp_add_inline_script(
			'wp-blocks',
			'var blockeraAvailableUserRoles = ' . wp_json_encode( $userRoles ) . ';
				if(window?.wp){
					wp.hooks.addFilter(
						"blockera.editor.extensions.currentUser",
						"blockera.unstableBootstrapServerSideCurrentUser",
						() => {						
							return ' . wp_json_encode( wp_get_current_user() ) . ';
						}
					);
					wp.hooks.addFilter(
						"blockera.editor.extensions.hooks.withBlockSettings.notAllowedUsers",
						"blockera.unstableBootstrapServerSideNotAllowedUsers",
						() => {
							const {
								general: {
									disableRestrictBlockVisibility,
									allowedUserRoles,
								},
							} = blockeraSettings;
							const allowedRoles = Object.keys(
								Object.fromEntries(Object.entries(allowedUserRoles).filter(([id, role]) => role.checked))
							);

							return Object.keys(
								Object.fromEntries(Object.entries(blockeraAvailableUserRoles).filter(([id]) => !allowedRoles.includes(id)))
							);
						}
					);
				}'
		);
	}

}
