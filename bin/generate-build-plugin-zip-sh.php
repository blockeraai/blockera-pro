#!/usr/bin/env php
<?php
/**
 * Generates the production (plugin build) version of `./bin/build-plugin-zip.sh`,
 * containing alternate `define` statements from the development version.
 *
 * @package blockera-pro-build
 */

$f             = fopen( dirname( __DIR__ ) . '/bin/build-plugin-zip.sh', 'r' );
$packages_root = dirname( __DIR__ ) . '/packages/global-packages/packages';
$vendor_root   = dirname( __DIR__ ) . '/vendor/blockera';

$filtered_packages = array_filter(
	(function () use ( $packages_root ) {
		$all_dirs = glob( $packages_root . '/*' ) ?: [];
		$result   = [];
		foreach ( $all_dirs as $dir ) {
			if ( ! is_dir( $dir ) ) {
				continue;
			}

			if ( substr( $dir, -strlen( '/blocks-library' ) ) === '/blocks-library' ) {
				foreach ( glob( $dir . '/*', GLOB_ONLYDIR ) ?: [] as $subdir ) {
					$result[] = $subdir;
				}
			} elseif ( substr( $dir, -strlen( '/features-library' ) ) === '/features-library' ) {
				foreach ( glob( $dir . '/*', GLOB_ONLYDIR ) ?: [] as $subdir ) {
					$result[] = $subdir;
				}
			} elseif ( substr( $dir, -strlen( '/blocks-pro' ) ) === '/blocks-pro' ) {
				foreach ( glob( $dir . '/*', GLOB_ONLYDIR ) ?: [] as $subdir ) {
					$result[] = $subdir;
				}
			} else {
				$result[] = $dir;
			}
		}
		return $result;
	})(),
	function ( string $package_name ): bool {
		if ( preg_match( '/dev-(.*)/', $package_name ) ) {
			return false;
		}

		if (
			! is_dir( $package_name . '/php' ) &&
			! is_dir( $package_name . '/core/php' ) &&
			! is_dir( $package_name . '/src' )
		) {
			return false;
		}

		return true;
	}
);

$packages = array_map(
	function ( string $package_name ) use ( $packages_root ) {
		$root_dir     = ( realpath( $packages_root ) ?: $packages_root ) . '/';
		$package_name = str_replace( '\\', '/', $package_name );
		$package_name = str_replace( $root_dir, '', $package_name );
		$package_name = preg_replace( '#^.*/packages/global-packages/packages/#', '', $package_name );

		$is_nested = preg_match( '/\bblocks-library\b/', $package_name )
			|| preg_match( '/\bfeatures-library\b/', $package_name )
			|| preg_match( '#^blocks-pro/#', $package_name );

		if ( $is_nested ) {
			$composer_file = $root_dir . $package_name . '/composer.json';
			if ( is_file( $composer_file ) ) {
				$composer = json_decode( file_get_contents( $composer_file ), true );
				if ( is_array( $composer ) && ! empty( $composer['name'] ) ) {
					return str_replace( 'blockera/', '', $composer['name'] );
				}
			}
		}

		return $package_name;
	},
	$filtered_packages
);

$packages = array_values(
	array_filter(
		$packages,
		function ( string $package_name ) use ( $vendor_root ): bool {
			return is_dir( $vendor_root . '/' . $package_name );
		}
	)
);

$internal_packages = array_filter(
	$packages,
	function ( string $package_name ): bool {
		if ( preg_match( '/-sdk$/', $package_name ) ) {
			return false;
		}

		return true;
	}
);

$sdks = array_diff( $packages, $internal_packages );

$inside_pattern_block = false;

while ( true ) {
	$line = fgets( $f );
	if ( false === $line ) {
		break;
	}

	switch ( trim( $line ) ) {

		case '### END AUTO-GENERATED VENDOR PACKAGES PATH PATTERN':
			$inside_pattern_block = false;
			break;

		case '### BEGIN AUTO-GENERATED VENDOR PACKAGES PATH PATTERN':
			$inside_pattern_block = true;

			$zip_paths = [];

			foreach ( $internal_packages as $name ) {
				$zip_paths[] = sprintf(
					'	$(find ./vendor/blockera/%1$s/ -type f ! -path "*/tests/*" \( -name "*.php" -o -name "*.json" -o -name "*.css" \)) \\',
					$name
				);
			}

			foreach ( $sdks as $name ) {
				$zip_paths[] = sprintf(
					'	$(find ./vendor/blockera/%1$s/ ! -path "*/tests/*") \\',
					$name
				);
			}

			if ( empty( $zip_paths ) ) {
				// Keep the `zip \ ... &&` continuation valid when no packages match.
				$zip_paths[] = '	$(true) \\';
			}

			echo implode( PHP_EOL, $zip_paths ) . PHP_EOL;

			break;

		default:
			if ( ! $inside_pattern_block ) {
				echo $line;
			}
			break;
	}
}

fclose( $f );
