// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

export const applyTransitionControlHooks = () => {
	addFilter(
		`blockera.controls.transition.props`,
		'blockera.pro.controls.transition.props',
		(props: Object) => {
			return {
				...props,
				PromoComponent: null,
			};
		}
	);
};
