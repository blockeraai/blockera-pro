// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

export const applyBoxShadowControlHooks = () => {
	addFilter(
		`blockera.controls.box-shadow.props`,
		'blockera.pro.controls.box-shadow.props',
		(props: Object) => {
			return {
				...props,
				PromoComponent: null,
			};
		}
	);
};
