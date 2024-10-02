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

		return blockera_core_config( $key, [ 'root' => BLOCKERA_PRO_PATH ] );
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
