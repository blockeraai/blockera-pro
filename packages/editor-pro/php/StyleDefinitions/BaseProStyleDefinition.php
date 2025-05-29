<?php 

namespace Blockera\SiteBuilder\StyleDefinitions;

use Blockera\Editor\StyleDefinitions\BaseStyleDefinition;
use Blockera\Editor\StyleDefinitions\Contracts\HasIgnoreChecks;

abstract class BaseProStyleDefinition extends BaseStyleDefinition implements HasIgnoreChecks {

	/**
	 * Check if the style definition is ignored.
	 *
	 * @return bool true if the style definition is ignored, false otherwise.
	 */
	public function isIgnoreChecks(): bool {

		return true;
	}
}
