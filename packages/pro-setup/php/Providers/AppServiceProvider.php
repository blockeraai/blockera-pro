<?php

namespace Blockera\Pro\Providers;

use Blockera\Bootstrap\ServiceProvider;

/**
 * Class AppServiceProvider for providing all application services.
 */
class AppServiceProvider extends ServiceProvider {

	/**
	 * Registering services classes.
	 *
	 * @return void
	 */
	public function register(): void {

		parent::register();
	}

	/**
	 * Bootstrap services.
	 *
	 * @return void
	 */
	public function boot(): void {

		parent::boot();

		add_action( 'init', [ $this, 'loadTextDomain' ] );
	}

	/**
	 * Loading text domain.
	 *
	 * @hooked `init`
	 *
	 * @return void
	 */
	public function loadTextDomain(): void {

		load_plugin_textdomain( 'blockera-pro', false, dirname( plugin_basename( BLOCKERA_PRO_FILE ) ) . '/languages' );
	}

}
