// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/** Matches {@see VARIATION_SURFACE_*} in the editor package (`style` | `size`). */
const VARIATION_SURFACES = ['style', 'size'];

const UNLIMITED_VARIATIONS = -1;

export const unlockGlobalStyles = () => {
	// Free uses `blockera.block.${variationSurface}.variations.globalStylesMaxItems` per surface.
	for (const surface of VARIATION_SURFACES) {
		addFilter(
			`blockera.block.${surface}.variations.globalStylesMaxItems`,
			'blockera-pro',
			() => UNLIMITED_VARIATIONS
		);
	}

	addFilter(
		'blockera.globalStyles.usageForMultipleBlocks.maxBlocks',
		'blockera-pro',
		() => {
			return -1;
		}
	);
};
