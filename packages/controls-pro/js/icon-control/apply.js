// @flow

import { addFilter } from '@wordpress/hooks';

export const applyIconControlHooks = () => {
	addFilter(
		'blockera.controls.iconControl.customIcon.featureType',
		'blockera-pro.controls.iconControl.customIcon.featureType',
		() => {
			return 'none';
		}
	);

	addFilter(
		'blockera.controls.iconControl.utils.getLibraryIcons.type',
		'blockera-pro.controls.iconControl.utils.getLibraryIcons.type',
		() => {
			return 'none';
		}
	);
};
