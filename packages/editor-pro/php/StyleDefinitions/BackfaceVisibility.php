<?php

namespace Blockera\SiteBuilder\StyleDefinitions;

use Blockera\Editor\StyleDefinitions\Traits\SimpleDefinitionTrait;
use Blockera\Editor\StyleDefinitions\Contracts\StandardDefinition;

class BackfaceVisibility extends BaseProStyleDefinition implements StandardDefinition {

    use SimpleDefinitionTrait;

    public function getCssProperty(): string
    {

        return 'backface-visibility';
    }
}
