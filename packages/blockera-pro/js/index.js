// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Blockera dependencies
 */
import { applyControls } from '@blockera/controls-pro';
import {
	applyExtensions,
	applyDefaultBlockStates,
	registerEditorExtensions,
} from '@blockera/editor-pro';

const initializeBlockeraPro = () => {
	registerEditorExtensions();
	applyControls();
	applyExtensions();
};

applyDefaultBlockStates();

/**
 * Initialize blockera react application.
 */
addFilter(
	'blockera.before.bootstrap',
	'blockera.pro.bootstrap',
	() => initializeBlockeraPro
);
