<?php

return [

	/*
    |--------------------------------------------------------------------------
    | Plugin Slug
    |--------------------------------------------------------------------------
    |
    | This value represents the slug of the Blockera Pro plugin.
    |
    */
	'pluginSlug' => 'blockera-pro',

	/*
    |--------------------------------------------------------------------------
    | Is Dev
    |--------------------------------------------------------------------------
    |
    | This value represents the is dev flag.
    |
    */
	'isDev' => blockera_core_config('app.debug'),

	/*
    |--------------------------------------------------------------------------
    | Product Name
    |--------------------------------------------------------------------------
    |
    | This value represents the name of the Blockera Pro plugin
    | in https://blockera.ai as product name. It is used when making API requests and managing licenses
    | to properly identify the Pro plugin for updates and license verification.
    |
    */
	'productName' => blockera_core_env('PRODUCT_NAME', 'blockera-site-builder-pro'),

	/*
    |--------------------------------------------------------------------------
    | Plugin Name
    |--------------------------------------------------------------------------
    |
    | This value represents the name of the Blockera Pro plugin.
    |
    */
	'pluginName' => __('Blockera PRO', 'blockera-pro'),

	/*
    |--------------------------------------------------------------------------
    | Plugin URL
    |--------------------------------------------------------------------------
    |
    | This value represents the URL of the Blockera Pro plugin.
    |
    */
	'pluginUrl' => blockera_core_env('PLUGIN_URL', 'https://blockera.ai/products/site-builder'),
];
