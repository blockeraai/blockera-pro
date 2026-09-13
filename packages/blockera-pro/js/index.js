// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Blockera dependencies
 */
import { applyControls } from '@blockera/controls-pro';
import { isAccountLicenseValid } from '@blockera/validator';
import {
	applyExtensions,
	bootstrapCanvasEditor,
	registerEditorExtensions,
} from '@blockera/editor-pro';

/**
 * Internal dependencies
 */
import { syncProProductLicense } from './register-product-license';

syncProProductLicense();

const initializeBlockeraPro = () => {
	syncProProductLicense();

	if (!isAccountLicenseValid()) {
		return;
	}

	bootstrapCanvasEditor();
	registerEditorExtensions();
	applyControls();
	applyExtensions();
};

/**
 * Initialize blockera react application.
 */
addFilter(
	'blockera.before.bootstrap',
	'blockera.pro.bootstrap',
	() => initializeBlockeraPro
);
