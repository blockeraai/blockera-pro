// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Blockera dependencies
 */
import { mergeObject } from '@blockera/utils';

/**
 * Internal dependencies
 */
import * as config from './config';
import { applyBlockStates } from './libs';

export const registerEditorExtensions = () => {
	addFilter(
		'blocks.registerBlockType',
		'blockeraPro-editorExtensions',
		(settings: Object, name: Object): Object => {
			const blockName = name.replace(/\//g, '-');

			Object.entries(config).forEach(([supportId, next]) =>
				addFilter(
					`blockera-${blockName}-extension-${supportId}`,
					'blockeraPro-editorBlockCustomizeExtension',
					(previous: Object) => mergeObject(previous, next)
				)
			);

			return settings;
		},
		10
	);
};

export const applyExtensions = (): void => {
	applyBlockStates();
};
