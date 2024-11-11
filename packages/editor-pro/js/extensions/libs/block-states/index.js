// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

export const applyBlockStates = (): void => {
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

	addFilter(
		'blockera.editor.styleEngine.allowedStates',
		'blockera.pro.editor.styleEngine.customization',
		(allowedStates: Array<string>): Array<string> => [
			...allowedStates,
			'active',
			'focus',
			'visited',
			'before',
			'after',
			'custom-class',
			'parent-class',
			'parent-hover',
		]
	);
};

export const applyDefaultBlockStates = (): void => {
	addFilter(
		'blockera.editor.extensions.blockStates.availableStates',
		'blockera.pro.controls.block-states.items',
		(states: Object): Object => {
			for (const stateKey in states) {
				const state = states[stateKey];

				if (state?.disabled) {
					state.disabled = false;
				}

				state.label = state.label.replace(' - Upgrade to RPO', '');
			}

			return states;
		}
	);
};
