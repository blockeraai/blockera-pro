#!/usr/bin/env php
<?php
/**
 * Generates the production (plugin build) version of `blockera-pro.php`,
 * containing alternate `define` statements from the development version.
 *
 * @package blockera-pro-build
 */

$f = fopen( dirname( __DIR__ ) . '/blockera-pro.php', 'r' );

$plugin_version = null;
$inside_defines = false;

/**
 * Prints `define` statements for the production version of `blockera-pro.php`
 * (the plugin entry point).
 */
function print_production_defines() {

	global $plugin_version;

	echo "define( 'BLOCKERA_PRO_VERSION', '$plugin_version' );\n";

	$git_commit = trim( shell_exec( 'git rev-parse HEAD' ) );

	echo "define( 'BLOCKERA_PRO_APP_MODE', 'production' );\n";
	echo "define( 'BLOCKERA_PRO_GIT_COMMIT', '$git_commit' );\n";
}

while ( true ) {
	$line = fgets( $f );
	if ( false === $line ) {
		break;
	}

	if (
		! $plugin_version &&
		preg_match( '@^\s*\*\s*Version:\s*([0-9.]+)@', $line, $matches )
	) {
		$plugin_version = $matches[1];
	}

	switch ( trim( $line ) ) {
		case '### BEGIN AUTO-GENERATED DEFINES':
			$inside_defines = true;
			echo $line;
			print_production_defines();
			break;

		case '### END AUTO-GENERATED DEFINES':
		case '### END AUTO-GENERATED FRONT CONTROLLERS':
			$inside_defines = false;
			echo $line;
			break;

		case '### BEGIN AUTO-GENERATED FRONT CONTROLLERS':
			$inside_defines = true;
			echo $line;
			echo "// loading front controller.
		require BLOCKERA_PRO_PATH . 'inc/app.php';\n";
			break;

		default:
			if ( ! $inside_defines ) {
				echo $line;
			}
			break;
	}
}

fclose( $f );
