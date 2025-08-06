// @flow

import { addFilter } from '@wordpress/hooks';

export const applyIconControlHooks = () => {
	addFilter(
		'blockera.controls.iconControl.uploadSVG.onClick',
		'blockera-pro.controls.iconControl.uploadSVG.onClick',
		(promotionOpener, open) => open
	);

	addFilter(
		'blockera.controls.iconControl.utils.getLibraryIcons.type',
		'blockera-pro.controls.iconControl.utils.getLibraryIcons.type',
		() => {
			return 'none';
		}
	);
};
