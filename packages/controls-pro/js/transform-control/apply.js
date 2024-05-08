// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

export const applyTransformControlHooks = () => {
	addFilter(
		`blockera.controls.transform.props`,
		'blockera.pro.controls.transform.props',
		(props: Object) => {
			return {
				...props,
				PromoComponent: null,
			};
		}
	);
};
