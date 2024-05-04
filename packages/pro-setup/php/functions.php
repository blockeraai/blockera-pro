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
