<?php

if ( ! function_exists('blockera_auth_pro_cleanup_auth_data')) {
	/**
	 * Cleanup authorization data while occurred problems on the blockera.ai server.
	 *
	 * @param string $key the key of the options table to be deleted.
	 * 
	 * @return bool true on success, false on failure.
	 */
	function blockera_auth_pro_cleanup_auth_data( string $key):bool {

		global $wpdb;

        $deleted_option_keys = $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM $wpdb->options WHERE option_name LIKE %s",
                '%' . $key . '%'
            )
        );

        if (is_int($deleted_option_keys)) {
            $deleted_option_keys = true;
        }

        return $deleted_option_keys;
	}
}
