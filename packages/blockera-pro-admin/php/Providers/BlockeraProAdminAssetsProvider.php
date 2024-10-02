<?php

namespace Blockera\Pro\Admin\Providers;

use Illuminate\Contracts\Container\BindingResolutionException;

/**
 * Class AssetsProvider providing all assets for admin side.
 *
 * @since 1.0.0
 */
class BlockeraProAdminAssetsProvider extends \Blockera\Admin\Providers\AdminAssetsProvider {

	/**
	 * Store loader identifier.
	 *
	 * @var string $id the loader identifier.
	 */
	public function getId(): string {

		return 'blockera-pro-admin-assets-loader';
	}

	protected function getAssets(): array {

		return array_merge(
			blockera_pro_core_config( 'assets.admin.list' ),
			parent::getAssets()
		);
	}

	/**
	 * @return string the blockera pro plugin root URL.
	 */
	protected function getURL(): string {

		return blockera_pro_core_config( 'app.root_url' );
	}

	/**
	 * @return string the blockera pro plugin root PATH.
	 */
	protected function getPATH(): string {

		return blockera_pro_core_config( 'app.root_path' );
	}

}
