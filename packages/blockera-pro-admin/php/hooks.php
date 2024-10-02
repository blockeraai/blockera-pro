<?php

add_filter( 'blockera.application.providers', 'blockera_pro_override_provider', 20 );

if ( ! function_exists( 'blockera_pro_override_admin_assets_provider' ) ) {

	/**
	 * Get filtered blockera application admin assets provider.
	 *
	 * @return array the filtered application provider.
	 */
	function blockera_pro_override_provider( array $providers ): array {

		$key = array_search( \Blockera\Admin\Providers\AdminAssetsProvider::class, $providers, true );

		$providers[ $key ] = \Blockera\Pro\Admin\Providers\BlockeraProAdminAssetsProvider::class;

		return $providers;
	}
}
