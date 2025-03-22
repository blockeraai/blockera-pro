<?php

namespace Blockera\Pro\Providers;

use Blockera\Http\Routes;
use Blockera\Setup\Providers\RestAPIProvider;

class BlockeraPRORestAPIProvider extends RestAPIProvider {

    /**
     * Initializing rest api
     *
     * @throws BindingResolutionException The BindingResolutionException for not bounded object.
     * @return array the list of registered routes.
     */
    public function initializeRestAPI(): array
    {
        $routes = $this->app->make(Routes::class);

        if (function_exists('blockera_load')) {
            blockera_load('Routes.api', dirname(__DIR__), compact('routes'));
        }

        return $routes::getRoutes();
    }
}
