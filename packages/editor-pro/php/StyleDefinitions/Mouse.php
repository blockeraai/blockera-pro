<?php

namespace Blockera\SiteBuilder\StyleDefinitions;

class Mouse extends BaseProStyleDefinition {

    /**
     * Collect all css selectors and declarations.
     *
     * @param array $setting
     *
     * @return array
     */
    public function css( array $setting): array
    {

        $cssProperty = $setting['type'];

        if (empty($cssProperty)) {

            return [];
        }

        $this->setDeclaration($cssProperty, $setting[ $cssProperty ]);

        $this->setCss($this->declarations);

        return $this->css;
    }
}
