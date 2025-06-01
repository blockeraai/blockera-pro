<?php

namespace Blockera\Pro;

use Blockera\Bootstrap\Application;

/**
 * Class Blockera to contains all services and entities.
 */
class BlockeraPro extends Application {

	/**
	 * Holds the license.
	 *
	 * @var array $license the license.
	 */
	protected array $license = [];

	/**
	 * Blockera constructor.
	 */
	public function __construct() {

		$this->service_providers = blockera_pro_core_config( 'app.providers' );

		// Keep parent functionalities.
		parent::__construct();
	}

	/**
	 * Set the license.
	 *
	 * @param array $license the license.
	 */
	public function setLicense( array $license): void {
		$this->license = $license;
	}

	/**
	 * Get the license.
	 *
	 * @return array The license.
	 */
	public function getLicense(): array {
		return $this->license;
	}
}
