<?php
/**
 * Shared helpers for Blockera Pro PHP package tests.
 *
 * @package blockera-pro
 */

namespace Blockera\Pro\Tests;

use Blockera\Dev\PHPUnit\AppTestCase;

/**
 * Base test case for pro package integration tests.
 */
abstract class TestCase extends AppTestCase {

	/**
	 * Load pro helpers after WordPress boots.
	 *
	 * @return void
	 */
	public function set_up(): void {
		parent::set_up();

		if ( ! function_exists( 'blockera_pro_get_product_details' ) ) {
			require_once dirname( __DIR__ ) . '/functions.php';
		}
	}
}
