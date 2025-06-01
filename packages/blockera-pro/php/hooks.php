<?php

use Blockera\Setup\Providers\EditorAssetsProvider;
use Blockera\Pro\Providers\BlockeraProEditorAssetsProvider;

add_filter('blockera/config/entities', 'blockera_pro_get_filtered_entities');

if (! function_exists('blockera_pro_get_filtered_entities')) {

    /**
     * Get filtered entities.
     *
     * @param array $entities the previous entities.
     *
     * @return array the filtered entities.
     */
    function blockera_pro_get_filtered_entities( array $entities): array {
		$entities['blockera']['account'] = blockera_pro_core_config('account');

        return $entities;
    }
}

add_filter('blockera.application.providers', 'blockera_pro_override_editor_assets_provider');

if (! function_exists('blockera_pro_override_editor_assets_provider')) {

    /**
     * Get filtered blockera editor assets application provider.
     *
     * @return array the filtered application provider.
     */
    function blockera_pro_override_editor_assets_provider( array $providers): array {
        $key = array_search(EditorAssetsProvider::class, $providers, true);

        $providers[ $key ] = BlockeraProEditorAssetsProvider::class;

        return $providers;
    }
}
