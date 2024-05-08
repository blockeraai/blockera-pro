// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

export const applyTextShadowControlHooks = () => {
	addFilter(
		`blockera.controls.text-shadow.props`,
		'blockera.pro.controls.text-shadow.props',
		(props: Object) => {
			return {
				...props,
				PromoComponent: null,
			};
		}
	);
};
