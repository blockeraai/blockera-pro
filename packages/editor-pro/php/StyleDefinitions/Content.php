<?php

namespace Blockera\SiteBuilder\StyleDefinitions;

use Blockera\Editor\StyleDefinitions\Traits\SimpleDefinitionTrait;
use Blockera\Editor\StyleDefinitions\Contracts\StandardDefinition;

class Content extends BaseProStyleDefinition implements StandardDefinition {

    use SimpleDefinitionTrait;

    public function getCssProperty(): string
    {

        return 'content';
    }

    /**
     * Validate the setting before generating css.
     *
     * @return boolean true on success, false on failure.
     */
    protected function validate(): bool
    {

        return in_array($this->pseudo_state, $this->getSupports(false)['blockeraContentPseudoElement']['hasDefaultValueInStates'], true);
    }
}
