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
	bootstrapCanvasEditor,
	applyDefaultBlockStates,
	registerEditorExtensions,
} from '@blockera/editor-pro';

const initializeBlockeraPro = () => {
	bootstrapCanvasEditor();
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
