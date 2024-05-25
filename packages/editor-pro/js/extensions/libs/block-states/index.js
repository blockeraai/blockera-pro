// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

export const applyBlockStates = (): void =>
	addFilter(
		`blockera.controls.block-states.props`,
		'blockera.pro.controls.block-states.props',
		(props: Object) => {
			return {
				...props,
				PromoComponent: null,
			};
		}
	);
