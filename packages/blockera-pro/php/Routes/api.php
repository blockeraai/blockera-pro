<?php

// phpcs:disable
use Blockera\Http\RestfullAPI;
use Blockera\Http\Routes;

// direct access is not allowed.
if (! defined('ABSPATH')) {
    exit;
}


/**
 * @var Routes|RestfullAPI $routes
 */

try {

    
$routes->post('auth/licenses', [Blockera\Auth\Http\Controllers\ConnectionController::class, 'getLicenses']);
$routes->post('auth/unsubscribe', [Blockera\Auth\Http\Controllers\ConnectionController::class, 'unsubscribe']);
$routes->post('auth/is-connected', [Blockera\Auth\Http\Controllers\ConnectionController::class, 'isConnected']);
$routes->post('auth/create-account', [Blockera\Auth\Http\Controllers\ConnectionController::class, 'createAccount']);
$routes->post('auth/connect-account', [Blockera\Auth\Http\Controllers\ConnectionController::class, 'connectAccount']);


} catch (Exception $exception) {

    return $exception->getMessage();
}
