<?php

return [
	'editor' => [
		'list'      => [
			'blockera-pro',
		],
		'with-deps' => [],
		'dequeue'   => [
			'@blockera/blockera',
		],
	],
	'admin'  => [
		'list'      => [
			'blockera-pro-admin',
		],
		'with-deps' => [],
		'dequeue'   => [
			'@blockera/blockera-admin',
		],
	],
];
