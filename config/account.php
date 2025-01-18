<?php

use Blockera\Auth\Config as AuthConfig;

$oauth_option = get_option(AuthConfig::getOptionKey(), []);
$products_licenses = array_column($oauth_option['licenses'] ?? [], 'productName');
$license_index = array_search(blockera_pro_core_config('auth.productName'), $products_licenses, true);
$license = $oauth_option['licenses'][$license_index] ?? [];

// unset the all licenses from the oauth option because it's not needed in the account info.
unset($oauth_option['licenses']);

$account = array_merge($oauth_option, compact('license'));

return $account;
