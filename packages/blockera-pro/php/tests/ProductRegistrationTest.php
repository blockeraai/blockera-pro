<?php
/**
 * Integration tests for the pro product registration into blockera/products.
 *
 * @package blockera-pro
 */

namespace Blockera\Pro\Tests;

use Blockera\Products\Registry;
use ReflectionProperty;

/**
 * Covers blockera_pro_get_product_details() / blockera_pro_register_product()
 * and the `blockera/products/registry/init` wiring in php/hooks.php.
 */
class ProductRegistrationTest extends TestCase {

	/**
	 * Load the products registrant helpers and start from a clean registry.
	 *
	 * @return void
	 */
	public function set_up(): void {
		parent::set_up();

		$this->resetProductsRegistry();
	}

	/**
	 * Leave a clean registry for other suites.
	 *
	 * @return void
	 */
	public function tear_down(): void {
		$this->resetProductsRegistry();

		parent::tear_down();
	}

	/**
	 * Reset the products Registry singleton (private static instance).
	 *
	 * @return void
	 */
	private function resetProductsRegistry(): void {
		if ( ! class_exists( Registry::class ) ) {
			return;
		}

		$property = new ReflectionProperty( Registry::class, 'instance' );
		$property->setAccessible( true );
		$property->setValue( null, null );
	}

	/**
	 * Whether the current environment runs blockera-pro as the standalone plugin.
	 *
	 * @return bool
	 */
	private function isStandalonePluginEnv(): bool {
		return defined( 'WP_PLUGIN_DIR' )
			&& defined( 'BLOCKERA_PRO_FILE' )
			&& 0 === strpos(
				wp_normalize_path( BLOCKERA_PRO_FILE ),
				trailingslashit( wp_normalize_path( WP_PLUGIN_DIR ) )
			);
	}

	/**
	 * Product details must follow product-details.schema.json and mirror plugin headers.
	 *
	 * @return void
	 */
	public function test_product_details_shape(): void {
		$details = blockera_pro_get_product_details();

		$this->assertSame( 'blockera-pro', $details['slug'] );
		$this->assertSame( 'plugin', $details['type'] );
		$this->assertSame( 'active', $details['status'] );
		$this->assertTrue( $details['isCompanion'] );
		$this->assertNotEmpty( $details['name'] );
		$this->assertNotEmpty( $details['version'] );

		foreach ( array( 'name', 'slug', 'version', 'type', 'status', 'isCompanion' ) as $key ) {
			$this->assertArrayHasKey( $key, $details );
		}
	}

	/**
	 * The registrant must store a valid product into the registry.
	 *
	 * @return void
	 */
	public function test_registrant_stores_pro_product(): void {
		if ( ! function_exists( 'blockera_register_product' ) ) {
			$this->markTestSkipped( 'blockera/products package is not available.' );
		}

		blockera_pro_register_product();

		if ( $this->isStandalonePluginEnv() ) {
			$product = blockera_get_product( 'blockera-pro' );

			$this->assertIsArray( $product );
			$this->assertSame( blockera_pro_get_product_details(), $product );
		} else {
			$this->assertNull( blockera_get_product( 'blockera-pro' ) );
		}
	}

	/**
	 * hooks.php must wire the registrant so lazy registry access includes pro.
	 *
	 * @return void
	 */
	public function test_lazy_registration_via_registry_init_action(): void {
		if ( ! function_exists( 'blockera_register_product' ) ) {
			$this->markTestSkipped( 'blockera/products package is not available.' );
		}

		require_once dirname( __DIR__ ) . '/hooks.php';

		$this->assertNotFalse( has_action( 'blockera/products/registry/init', 'blockera_pro_register_product' ) );

		$products = blockera_get_products();

		if ( $this->isStandalonePluginEnv() ) {
			$this->assertArrayHasKey( 'blockera-pro', $products );
			$this->assertSame( 'plugin', $products['blockera-pro']['type'] );

			$payload = blockera_products_localize();
			$this->assertArrayHasKey( 'blockera-pro', $payload['products'] );
		} else {
			$this->assertArrayNotHasKey( 'blockera-pro', $products );
		}
	}
}
