<?php

add_filter('blockera.application.providers', 'blockera_pro_override_providers', 20);

if (! function_exists('blockera_pro_override_providers')) {

    /**
     * Get filtered blockera application admin assets provider.
     *
     * @return array the filtered application provider.
     */
    function blockera_pro_override_providers( array $providers): array {
        $key = array_search(\Blockera\Admin\Providers\AdminAssetsProvider::class, $providers, true);

        $providers[ $key ] = \Blockera\Pro\Admin\Providers\BlockeraProAdminAssetsProvider::class;

        $providers[] = \Blockera\Admin\Providers\AdminAssetsProvider::class;

        return $providers;
    }
}

if (! function_exists('blockera_pro_add_account_menu')) {
    /**
     * Add account menu.
     *
     * @param array $menu the menu.
     *
     * @return array the filtered menu.
     */
    function blockera_pro_add_account_menu( array $menu): array {
        // Remove upgrade to pro menu item, because in this state we don't need it.
        unset($menu['submenus']['upgrade-to-pro']);

        $menu['submenus'] = array_merge(
            $menu['submenus'],
            blockera_pro_core_config('menu')
        );

        return $menu;
    }
}

add_filter('blockera.config.menu', 'blockera_pro_add_account_menu');
