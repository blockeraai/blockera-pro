<?php
/**
 * Allow SVG uploads for icon-control Pro e2e tests.
 *
 * WordPress core rejects image/svg+xml by default; MediaUploader in the icon
 * picker only accepts SVG, so Select stays disabled unless uploads can succeed.
 */
add_filter(
	'upload_mimes',
	static function ( $mimes ) {
		$mimes['svg']  = 'image/svg+xml';
		$mimes['svgz'] = 'image/svg+xml';
		return $mimes;
	}
);

add_filter(
	'wp_check_filetype_and_ext',
	static function ( $data, $file, $filename, $mimes ) {
		$ext = strtolower( pathinfo( $filename, PATHINFO_EXTENSION ) );
		if ( 'svg' === $ext || 'svgz' === $ext ) {
			$data['ext']             = $ext;
			$data['type']            = 'image/svg+xml';
			$data['proper_filename'] = $filename;
		}
		return $data;
	},
	10,
	4
);

// Bypass core upload real-type checks that still reject SVG after mime allow.
add_filter( 'wp_prevent_unsupported_mime_type_uploads', '__return_false' );
