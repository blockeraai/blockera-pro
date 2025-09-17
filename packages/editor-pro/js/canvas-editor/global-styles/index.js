// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

export const unlockGlobalStyles = () => {
	addFilter(
		'blockera.block.style.variations.globalStylesMaxItems',
		'blockera-pro',
		() => {
			return -1;
		}
	);
};
