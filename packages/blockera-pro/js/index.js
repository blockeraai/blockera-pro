// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Blockera dependencies
 */
// import { reregistrationBlocks } from '@blockera/blocks';

/**
 * Blockera dependencies
 */
import { initializer } from '@blockera/bootstrap';
import { applyControls } from '@blockera/controls-pro';
import { registerEditorExtensions } from '@blockera/editor-extensions-pro';

/**
 * Internal dependencies
 */

/**
 * Initialize blockera react application.
 */
addFilter('blockera.bootstrapper', 'blockera.pro.bootstrap', () => {
	registerEditorExtensions();
	applyControls();
});

initializer();
