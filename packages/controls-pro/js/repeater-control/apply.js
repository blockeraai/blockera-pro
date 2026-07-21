// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

export const applyRepeaterControlHooks = () => {
	addFilter(
		'blockera.repeater.shouldGateRepeaterItemHeaderForPromo',
		'blockera.pro.repeater.shouldGateRepeaterItemHeaderForPromo',
		// shouldGateRepeaterItemHeaderForPromo as the first argument is available in the callback, optionally.
		// args as the second argument is available in the callback, optionally.
		() => {
			return true;
		}
	);
};
