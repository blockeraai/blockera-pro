// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

export const applyBackgroundControlHooks = () => {
	addFilter(
		'blockera.controls.background.meshGradientColors.OnChange',
		'blockera.pro.controls.background.meshGradientColors.onChange',
		(
			noop: () => {},
			{ item, changeRepeaterItem, controlId, repeaterId, itemId }: Object
		) => {
			return (newValue: Object): void => {
				changeRepeaterItem({
					controlId,
					value: {
						...item,
						color: newValue,
					},
					repeaterId,
					itemId,
				});
			};
		}
	);
};
