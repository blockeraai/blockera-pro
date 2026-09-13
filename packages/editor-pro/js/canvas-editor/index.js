// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Blockera dependencies
 */
import { isAccountLicenseValid } from '@blockera/validator';

export const bootstrapCanvasEditor = () => {
	if (!isAccountLicenseValid()) {
		return;
	}

	addFilter(
		'blockera.editor.canvasEditor.bootstrap.breakpoints',
		'blockeraPro.editorPro.canvasEditor.bootstrap',
		(breakpoints) => {
			return Object.fromEntries(
				Object.entries(breakpoints).map(([key, breakpoint]) => {
					const nextBreakpoint: Object = { ...breakpoint };

					if ('' === breakpoint.type) {
						nextBreakpoint.type = key;
					}

					return [key, nextBreakpoint];
				})
			);
		}
	);
};

export { unlockGlobalStyles } from './global-styles';
