<?php

namespace Blockera\SiteBuilder\StyleDefinitions;

use Blockera\Editor\StyleDefinitions\Contracts\CustomStyle;

class Order extends BaseProStyleDefinition implements CustomStyle {

    protected function css( array $setting): array {

        $declaration = [];
        $cssProperty = $setting['type'];

        if (empty($cssProperty) || empty($setting[ $cssProperty ]) || 'order' !== $cssProperty) {

            return $declaration;
        }

        $orderType = $setting['order'];

        switch ($orderType) {
            case 'first':
                $this->setDeclaration('order', '-1');
                break;

            case 'last':
                $this->setDeclaration('order', '100');
                break;

            case 'custom':
                $this->setDeclaration('order', $setting['custom'] ? blockera_get_value_addon_real_value($setting['custom']) : '100');
                break;
        }

        $this->setCss($this->declarations);

        return $this->css;
    }

	/**
     * @inheritDoc
     *
     * @param array  $settings
     * @param string $settingName
     * @param string $cssProperty
     *
     * @return array
     */
    public function getCustomSettings( array $settings, string $settingName, string $cssProperty): array {

        $settings = blockera_get_sanitize_block_attributes($settings);

        if (isset($settings['value']) && 'custom' === $settings['value'] && 'order' === $cssProperty) {

            $setting = [
                [
                    'isVisible'  => true,
                    'type'       => $cssProperty,
                    $cssProperty => $settings['value']['blockeraFlexChildOrder'] ?? 'custom',
                    'custom'     => $settings['value']['blockeraFlexChildOrderCustom'] ?? '',
                ],
            ];

        } else {

            $setting = [
                [
                    'isVisible'  => true,
                    'type'       => $cssProperty,
                    $cssProperty => $settings['value'] ?? [],
                ],
            ];
        }

        return $setting;
    }
}
