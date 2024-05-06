<?php
/**
 * The application bootstrapper.
 *
 * @package bootstrpa/app.php
 */

global $blockera_pro;

$blockera_pro = new \Blockera\Pro\BlockeraPro();

$blockera_pro->bootstrap();
