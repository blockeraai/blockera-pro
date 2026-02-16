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

	addFilter(
		'blockera.globalStyles.usageForMultipleBlocks.maxBlocks',
		'blockera-pro',
		() => {
			return -1;
		}
	);
};
