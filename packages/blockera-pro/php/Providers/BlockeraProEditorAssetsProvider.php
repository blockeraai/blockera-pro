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

		return array_merge(
			blockera_pro_core_config( 'assets.editor.list' ),
			parent::getAssets()
		);
	}

	/**
	 * @return string the blockera pro plugin root URL.
	 */
	protected function getURL(): string {

		return blockera_pro_core_config( 'app.root_url' );
	}

	/**
	 * @return string the blockera pro plugin root PATH.
	 */
	protected function getPATH():string {

		return blockera_pro_core_config( 'app.root_path' );
	}

	/**
	 * Localize js variables and scripts on inline script of page.
	 *
	 * @return void
	 */
	public function localization(): void {

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

							if(!disableRestrictBlockVisibility){
								return [];
							}

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
