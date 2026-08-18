<?php
/**
 * The functions blockera pro app.
 *
 * @package functions.php
 */

if ( ! function_exists( 'blockera_pro_core_config' ) ) {

	/**
	 * Retrieve the config with key param or return all config as array
	 *
	 * @param string $key the key of config.
	 *
	 * @return mixed config value.
	 */
	function blockera_pro_core_config( string $key ) {

		return blockera_core_config( $key, [ 'root' => rtrim(BLOCKERA_PRO_PATH, '/') ] );
	}
}

if ( ! function_exists( 'blockera_pro_get_root_path' ) ) {

	/**
	 * Get root directory PATH.
	 *
	 * @return string the blockera-pro root directory PATH.
	 */
	function blockera_pro_get_root_path(): string {

		return blockera_pro_core_config( 'app.root_path' );
	}
}

if ( ! function_exists( 'blockera_pro_get_root_url' ) ) {

	/**
	 * Get root directory URL.
	 *
	 * @return string the blockera-pro root directory URL.
	 */
	function blockera_pro_get_root_url(): string {

		return blockera_pro_core_config( 'app.root_url' );
	}
}

if ( ! function_exists( 'blockera_pro_get_product_details' ) ) :
	/**
	 * Blockera Pro plugin product details for the products registry.
	 *
	 * Shape follows blockera/products `product-details.schema.json`.
	 * Details are read from the plugin entry file headers so version bumps
	 * need no code change.
	 *
	 * @return array<string, mixed>
	 */
	function blockera_pro_get_product_details(): array {
		$headers = get_file_data(
			BLOCKERA_PRO_FILE,
			array(
				'Name'        => 'Plugin Name',
				'PluginURI'   => 'Plugin URI',
				'Description' => 'Description',
				'Author'      => 'Author',
				'RequiresWP'  => 'Requires at least',
				'RequiresPHP' => 'Requires PHP',
			)
		);

		return array(
			'name'        => ! empty( $headers['Name'] ) ? $headers['Name'] : 'Blockera Site Builder [PRO]',
			'description' => ! empty( $headers['Description'] ) ? $headers['Description'] : '',
			'slug'        => 'blockera-pro',
			'version'     => defined( 'BLOCKERA_PRO_VERSION' ) ? BLOCKERA_PRO_VERSION : '0.0.0',
			'type'        => 'plugin',
			'status'      => 'active',
			'isCompanion' => true,
			'author'      => ! empty( $headers['Author'] ) ? $headers['Author'] : '',
			'homepage'    => ! empty( $headers['PluginURI'] ) ? $headers['PluginURI'] : '',
			'requires'    => array(
				'wordpress' => ! empty( $headers['RequiresWP'] ) ? $headers['RequiresWP'] : '',
				'php'       => ! empty( $headers['RequiresPHP'] ) ? $headers['RequiresPHP'] : '',
			),
		);
	}
endif;

if ( ! function_exists( 'blockera_pro_register_product' ) ) :
	/**
	 * Register the Blockera Pro plugin into the blockera products registry.
	 *
	 * Hooked on `blockera/products/registry/init` (fires once, on first read
	 * access of the registry) — see packages/blockera-pro/php/hooks.php.
	 *
	 * Registration is skipped when the entry file is not under WP_PLUGIN_DIR.
	 *
	 * @return void
	 */
	function blockera_pro_register_product(): void {
		if ( ! function_exists( 'blockera_register_product' ) || ! defined( 'BLOCKERA_PRO_FILE' ) ) {
			return;
		}

		$entry = wp_normalize_path( BLOCKERA_PRO_FILE );

		if ( ! defined( 'WP_PLUGIN_DIR' ) || 0 !== strpos( $entry, trailingslashit( wp_normalize_path( WP_PLUGIN_DIR ) ) ) ) {
			return;
		}

		blockera_register_product( blockera_pro_get_product_details() );
	}
endif;
