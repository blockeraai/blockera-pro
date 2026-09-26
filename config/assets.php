<?php
/**
 * Direct access is not allowed.
 *
 * @package config/assets.php
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'editor' => [
		'list'      => [
			'utils',
			'products',
			'storage',
			'classnames',
			'icons',
			'blockera-pro',
			'interact-editor',
			'data-editor',
			'env',
			'data',
			'controls',
			'controls-pro',
			'editor-pro',
			'blocks-pro-core',
			'validator-pro',
			'telemetry',
			'feature-icon',
			'features-core',
			'global-styles-ui',
			'editor',
			'blocks-core',
			'bootstrap',
			'blockera',
			'blockera-one',
			'editor-styles',
			'telemetry-styles',
			'controls-styles',
			'value-addons-styles',
			'blocks-core-styles',
			'global-styles-ui-styles',
		],
		'enqueue'   => [
			'blockera-pro',
		],
		'with-deps' => [],
	],
	'admin'  => [
		'list'      => [
			'utils',
			'products',
			'storage',
			'classnames',
			'icons',
			'data-editor',
			'env',
			'data',
			'controls',
			'auth',
			'telemetry',
			'bootstrap',
			// Theme Check WordPress_Spelling_Check treats this incorrectly.
			// But this is not a translatable text and it is actually a valid word.
			'word' . 'press',
			'blockera-admin',
			'auth-styles',
			'controls-styles',
			'wordpress-styles',
			'telemetry-styles',
			'blockera-admin-styles',
			'auth-pro',
			'auth-pro-styles',
			'blockera-pro-admin',
			'blockera-pro-admin-styles',
		],
		'with-deps' => [
			'@blockera/auth-pro'           => [
				'@blockera/products',
				'@blockera/utils',
				'@blockera/classnames',
				'@blockera/icons',
				'@blockera/data',
				'@blockera/data-editor',
				'@blockera/env',
				'@blockera/storage',
				'@blockera/controls',
				'@blockera/auth',
			],
			'@blockera/blockera-pro-admin' => [
				'@blockera/products',
				'@blockera/utils',
				'@blockera/classnames',
				'@blockera/icons',
				'@blockera/data',
				'@blockera/data-editor',
				'@blockera/env',
				'@blockera/storage',
				'@blockera/controls',
				'@blockera/auth',
				'@blockera/auth-pro',
				'@blockera/bootstrap',
				'@blockera/wordpress',
			],
		],
	],
	'guard'  => [
		'list'      => [
			'guard-pro',
		],
		'enqueue'   => [
			'features-manager',
		],
		'with-deps' => [
			'@blockera/feature-manager' => [
				'@blockera/blockera',
			],
		],
	],
	'compat' => [
		'list'      => [
			'plugin-compatibility',
			'plugin-compatibility-styles',
			'plugin-compatibility-pro',
		],
		'with-deps' => [],
	],
];
