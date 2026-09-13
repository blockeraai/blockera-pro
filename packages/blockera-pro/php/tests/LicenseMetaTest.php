<?php
/**
 * Tests for coarse product license flags (no secrets).
 *
 * @package blockera-pro
 */

namespace Blockera\Pro\Tests;

/**
 * Covers blockera_pro_license_meta_from_account().
 */
class LicenseMetaTest extends TestCase {

	/**
	 * @return array<string, mixed>
	 */
	private function validAccount( array $license_overrides = array() ): array {
		return array(
			'client_id'      => 'cid',
			'client_secret'  => 'csecret',
			'access_token'   => 'at',
			'refresh_token'  => 'rt',
			'license'        => array_merge(
				array(
					'id'                 => '99',
					'type'               => 'subscription',
					'name'               => '#99 - Example',
					'status'             => 'active',
					'startDate'          => '2020-01-01',
					'licenseKey'         => 'key',
					'nextPaymentDueDate' => '2099-01-01',
				),
				$license_overrides
			),
		);
	}

	public function test_empty_account_is_missing(): void {
		$meta = blockera_pro_license_meta_from_account( array() );

		$this->assertFalse( $meta['valid'] );
		$this->assertSame( 'missing', $meta['status'] );
	}

	public function test_incomplete_license_is_invalid(): void {
		$meta = blockera_pro_license_meta_from_account(
			array(
				'license' => array(
					'id' => '99',
				),
			)
		);

		$this->assertFalse( $meta['valid'] );
		$this->assertSame( 'invalid', $meta['status'] );
	}

	public function test_inactive_status_is_invalid(): void {
		$meta = blockera_pro_license_meta_from_account(
			$this->validAccount( array( 'status' => 'cancelled' ) )
		);

		$this->assertFalse( $meta['valid'] );
		$this->assertSame( 'invalid', $meta['status'] );
	}

	public function test_name_prefix_mismatch_is_invalid(): void {
		$meta = blockera_pro_license_meta_from_account(
			$this->validAccount( array( 'name' => 'Example' ) )
		);

		$this->assertFalse( $meta['valid'] );
		$this->assertSame( 'invalid', $meta['status'] );
	}

	public function test_past_due_subscription_is_expired(): void {
		$meta = blockera_pro_license_meta_from_account(
			$this->validAccount( array( 'nextPaymentDueDate' => '2000-01-01' ) )
		);

		$this->assertFalse( $meta['valid'] );
		$this->assertSame( 'expired', $meta['status'] );
	}

	public function test_complete_active_account_is_valid(): void {
		$meta = blockera_pro_license_meta_from_account( $this->validAccount() );

		$this->assertTrue( $meta['valid'] );
		$this->assertSame( 'active', $meta['status'] );
		$this->assertArrayNotHasKey( 'licenseKey', $meta );
		$this->assertArrayNotHasKey( 'access_token', $meta );
	}
}
