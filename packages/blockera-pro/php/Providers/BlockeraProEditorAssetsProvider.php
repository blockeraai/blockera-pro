<?php

namespace Blockera\Pro\Providers;

use Blockera\Setup\Providers\EditorAssetsProvider;
use Illuminate\Contracts\Container\BindingResolutionException;

/**
 * Class BlockeraProAssetsProvider providing all pro assets.
 *
 * @since 1.0.0
 */
class BlockeraProEditorAssetsProvider extends EditorAssetsProvider {

	/**
	 * Store loader identifier.
	 *
	 * @return string the loader identifier.
	 */
	public function getId(): string {

		return 'blockera-pro-assets-loader';
	}

	/**
	 * Bootstrap any application services.
	 *
	 * @throws BindingResolutionException Binding resolution exception error handle.
	 * @return void
	 */
	public function boot(): void {

		parent::boot();

		add_action( 'admin_enqueue_scripts', [ $this, 'localization' ], 9e2 );
	}

	/**
	 * Override parent assets list.
	 *
	 * @return array the blockera editor assets.
	 */
	protected function getAssets():array {

		$assets = parent::getAssets();
		
		$icons_index = array_search('icons', $assets, true);

		if ($icons_index) {
			array_splice($assets, $icons_index + 1, 0, [ 'blockera-pro' ]);

			return $assets;
		}

		return [];
	}

	/**
	 * Localize js variables and scripts on inline script of page.
	 *
	 * @return void
	 */
	public function localization(): void {

		wp_add_inline_script(
			'wp-blocks',
			'if(window?.wp){
				wp.hooks.addFilter(
					"blockera.editor.extensions.currentUser",
					"blockera.unstableBootstrapServerSideCurrentUser",
					() => {						
						return ' . wp_json_encode( wp_get_current_user() ) . ';
					}
				);
				wp.hooks.addFilter(
					"blockera.editor.extensions.hooks.withBlockSettings.allowedUsers",
					"blockera.unstableBootstrapServerSideAllowedUsers",
					() => {
						const {
							general: {
								disableRestrictBlockVisibility,
								allowedUserRoles,
							},
						} = blockeraSettings;
						if(!disableRestrictBlockVisibility){
							return [];
						}

						const allowedRoles = Object.keys(
							Object.fromEntries(Object.entries(allowedUserRoles).filter(([id, checked]) => checked))
						);

						allowedRoles.push("administrator");

						return allowedRoles;
					}
				);
				wp.hooks.addFilter(
					"blockera.editor.extensions.hooks.withBlockSettings.allowedPostTypes",
					"blockera.unstableBootstrapServerSideAllowedPostTypes",
					() => {
						const {
							general: {
								allowedPostTypes,
								disableRestrictBlockVisibilityByPostType,
							},
						} = blockeraSettings;
						if(!disableRestrictBlockVisibilityByPostType){
							return [];
						}

						return Object.keys(
							Object.fromEntries(Object.entries(allowedPostTypes).filter(([id, checked]) => checked))
						);
					}
				);
			}
			var blockeraCurrentPostType = ' . wp_json_encode( get_post_type() ) . ';
			var blockeraAccount = ' . wp_json_encode( blockera_pro_core_config( 'account' ) ) . ';'
		);
	}

	/**
	 * Get fallback arguments.
	 *
	 * @return array the fallback arguments.
	 */
	protected function getFallbackArgs(): array {

		return [
			'url'  => blockera_pro_core_config( 'app.root_url' ),
			'path' => blockera_pro_core_config( 'app.root_path' ),
			'debug-mode' => blockera_pro_core_config( 'app.debug' ),
		];
	}
}
