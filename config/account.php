<?php

use Blockera\Auth\Repositories\OptionRepository;

$oauth_option      = OptionRepository::getOption();
$product_name      = blockera_pro_core_config('auth.productName');
$licenses          = $oauth_option['licenses'] ?? [];
$matching_licenses = array_values(
	array_filter(
		$licenses,
		static fn( array $license ): bool => ( $license['productName'] ?? '' ) === $product_name
	)
);

usort(
	$matching_licenses,
	static function ( array $a, array $b ): int {
		$a_priority = 'non-subscription' === ( $a['type'] ?? '' ) ? 0 : 1;
		$b_priority = 'non-subscription' === ( $b['type'] ?? '' ) ? 0 : 1;

		return $a_priority <=> $b_priority;
	}
);

$license = $matching_licenses[0] ?? [];

// unset the all licenses from the oauth option because it's not needed in the account info.
unset($oauth_option['licenses']);

$account = array_merge($oauth_option, compact('license'));

return $account;
