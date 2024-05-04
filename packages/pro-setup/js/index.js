// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Blockera dependencies
 */
import { initializer } from '@blockera/bootstrap';

/**
 * Initialize blockera react application.
 */
addFilter('blockera.core.bootstrap', 'blockera.pro.bootstrap', () => {
	console.log('Pro Installed !!!');
});

initializer();
