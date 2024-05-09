// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { getTransitionTypeOptions, getTransitionTimingOptions } from './utils';

export const applyTransitionControlHooks = () => {
	addFilter(
		`blockera.controls.transition.props`,
		'blockera.pro.controls.transition.props',
		(props: Object) => {
			return {
				...props,
				PromoComponent: null,
				getTransitionTypeOptions,
				getTransitionTimingOptions,
			};
		}
	);
};
