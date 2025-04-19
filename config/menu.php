<?php

$license = blockera_pro_core_config('account.license');
$is_activated_pro = !empty($license) && 'active' === ($license['status'] ?? 'expired');

if (!$is_activated_pro && !isset($_GET['registered-client'], $_GET['connectedWithYourAccount'])) {
	$pro_submenu = [
        'activate-pro-license' => [
            'page_title' => __('Activate Pro License', 'blockera'),
            'menu_title' => __('Activate Pro License', 'blockera'),
            'capability' => 'manage_options',
            'menu_slug'  => 'blockera-settings-account',
            'callback'   => 'blockera_settings_page_template',
        ],
    ];
} else {
    $pro_submenu = [
        'account' => [
            'page_title' => __('Account & Licenses', 'blockera'),
            'menu_title' => __('Account & Licenses', 'blockera'),
            'capability' => 'manage_options',
            'menu_slug'  => 'blockera-settings-account',
            'callback'   => 'blockera_settings_page_template',
        ],
    ];
}

return $pro_submenu;
