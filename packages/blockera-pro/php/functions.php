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

if ( ! function_exists( 'blockera_pro_get_product_details' ) ) {
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
			'meta'        => array(
				'license' => blockera_pro_get_license_meta(),
			),
		);
	}
}

if ( ! function_exists( 'blockera_pro_license_meta_from_account' ) ) {
	/**
	 * Coarse license flags for the products registry.
	 *
	 * Installed (`status: active` on the product) is not a license. Never put
	 * keys, tokens, or secrets on this payload.
	 *
	 * @param array $account Account config (`client_*`, `access_token`, `license`).
	 *
	 * @return array{valid: bool, status: string}
	 */
	function blockera_pro_license_meta_from_account( array $account ): array {
		$license = $account['license'] ?? null;

		if ( ! is_array( $license ) || array() === $license ) {
			return array(
				'valid'  => false,
				'status' => 'missing',
			);
		}

		$id            = $license['id'] ?? '';
		$name          = $license['name'] ?? '';
		$type          = $license['type'] ?? '';
		$status        = $license['status'] ?? '';
		$license_key   = $license['licenseKey'] ?? '';
		$start_date    = $license['startDate'] ?? '';
		$due_date      = $license['nextPaymentDueDate'] ?? '';
		$client_id     = $account['client_id'] ?? '';
		$client_secret = $account['client_secret'] ?? '';
		$access_token  = $account['access_token'] ?? '';
		$refresh_token = $account['refresh_token'] ?? '';

		if (
			'' === $id
			|| '' === $name
			|| '' === $status
			|| '' === $license_key
			|| '' === $start_date
			|| '' === $due_date
			|| '' === $client_id
			|| '' === $client_secret
			|| '' === $access_token
			|| '' === $refresh_token
		) {
			return array(
				'valid'  => false,
				'status' => 'invalid',
			);
		}

		if ( 'active' !== $status ) {
			return array(
				'valid'  => false,
				'status' => 'invalid',
			);
		}

		$id_string = (string) $id;

		if ( 0 !== strpos( (string) $name, '#' . $id_string . ' - ' ) ) {
			return array(
				'valid'  => false,
				'status' => 'invalid',
			);
		}

		$now = time();

		if ( 'subscription' === $type ) {
			$due_ts   = strtotime( (string) $due_date );
			$start_ts = strtotime( (string) $start_date );

			if ( false !== $due_ts && $due_ts < $now ) {
				return array(
					'valid'  => false,
					'status' => 'expired',
				);
			}

			if ( false !== $start_ts && $start_ts > $now ) {
				return array(
					'valid'  => false,
					'status' => 'invalid',
				);
			}
		}

		return array(
			'valid'  => true,
			'status' => 'active',
		);
	}
}

if ( ! function_exists( 'blockera_pro_get_license_meta' ) ) {
	/**
	 * License flags from Pro account config for product localization.
	 *
	 * @return array{valid: bool, status: string}
	 */
	function blockera_pro_get_license_meta(): array {
		$account = array();

		if ( function_exists( 'blockera_pro_core_config' ) ) {
			$loaded  = blockera_pro_core_config( 'account' );
			$account = is_array( $loaded ) ? $loaded : array();
		}

		return blockera_pro_license_meta_from_account( $account );
	}
}

if ( ! function_exists( 'blockera_pro_register_product' ) ) {
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
}
