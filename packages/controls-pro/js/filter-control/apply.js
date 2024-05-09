// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

export const applyFilterControlHooks = () => {
	addFilter(
		`blockera.controls.filter.props`,
		'blockera.pro.controls.filter.props',
		(props: Object) => {
			return {
				...props,
				PromoComponent: null,
			};
		}
	);
	addFilter(
		`blockera.controls.backdrop-filter.props`,
		'blockera.pro.controls.backdrop-filter.props',
		(props: Object) => {
			return {
				...props,
				PromoComponent: null,
			};
		}
	);
};
