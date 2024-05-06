<?php

namespace Blockera\Pro;

use Blockera\Bootstrap\Application;

/**
 * Class Blockera to contains all services and entities.
 */
class BlockeraPro extends Application {

	/**
	 * Blockera constructor.
	 */
	public function __construct() {

		$this->service_providers = blockera_pro_core_config( 'app.providers' );

		// Keep parent functionalities.
		parent::__construct();
	}

}
