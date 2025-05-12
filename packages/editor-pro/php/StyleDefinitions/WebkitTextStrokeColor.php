<?php

namespace Blockera\SiteBuilder\StyleDefinitions;

class WebkitTextStrokeColor extends BaseProStyleDefinition {

    protected function css( array $setting): array
    {

        $declaration = [];
        $cssProperty = $setting['type'];

        if (empty($cssProperty) || empty($setting[ $cssProperty ]) || '-webkit-text-stroke-color' !== $cssProperty) {

            return $declaration;
        }

        $color = blockera_get_value_addon_real_value($setting[ $cssProperty ]['color']);

        if (! empty($color)) {

            $this->setDeclaration('-webkit-text-stroke-color', $color);

            if (! empty($setting[ $cssProperty ]['width'])) {

                $this->setDeclaration('-webkit-text-stroke-width', $setting[ $cssProperty ]['width']);
            }
        }

        $this->setCss($this->declarations);

        return $this->css;
    }
}
