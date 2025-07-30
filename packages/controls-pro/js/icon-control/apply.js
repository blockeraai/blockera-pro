// @flow

import { addFilter } from '@wordpress/hooks';

export const applyIconControlHooks = () => {
	addFilter(
		'blockera.controls.iconControl.uploadSVG.onClick',
		'blockera-pro.controls.iconControl.uploadSVG.onClick',
		(promotionOpener, open) => open()
	);
};
