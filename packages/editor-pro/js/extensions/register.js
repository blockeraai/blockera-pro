// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Blockera dependencies
 */
import { mergeObject } from '@blockera/utils';
import { isAccountLicenseValid } from '@blockera/validator';

/**
 * Internal dependencies
 */
import * as config from './config';
import { applyBlockStates, clearCache } from './libs';

/**
 * Merge free extension supports with Pro flags.
 * Inner-block usage must not fall back to native/companion locks.
 *
 * @param {Object} previous Free (or previously filtered) support map.
 * @param {Object} next Pro support overlay.
 * @return {Object} Merged support map.
 */
const mergeProExtensionSupport = (previous: Object, next: Object): Object => {
	const merged = mergeObject(previous, next);

	Object.keys(merged).forEach((key) => {
		if (!merged[key] || 'object' !== typeof merged[key]) {
			return;
		}

		const item = merged[key];

		if (
			!item.hasOwnProperty('onNativeOnInnerBlocks') ||
			true === item.onNativeOnInnerBlocks
		) {
			item.onNativeOnInnerBlocks = false;
		}
	});

	return merged;
};

export const registerEditorExtensions = () => {
	if (!isAccountLicenseValid()) {
		return;
	}

	addFilter(
		'blockera.extensions.innerBlocks.config',
		'blockeraPro-editorInnerBlocksExtensions',
		(previous: Object): Object => {
			const merged = { ...previous };

			Object.entries(config).forEach(([supportId, next]) => {
				merged[supportId] = mergeProExtensionSupport(
					previous[supportId] || {},
					next
				);
			});

			return merged;
		}
	);

	addFilter(
		'blocks.registerBlockType',
		'blockeraPro-editorExtensions',
		(settings: Object, name: Object): Object => {
			const blockName = name.replace(/\//g, '.');

			Object.entries(config).forEach(([supportId, next]) =>
				addFilter(
					`blockera.block.${blockName}.extension.${supportId}`,
					'blockeraPro-editorBlockCustomizeExtension',
					(previous: Object) =>
						mergeProExtensionSupport(previous, next)
				)
			);

			return settings;
		},
		10
	);
};

export const applyExtensions = (): void => {
	clearCache();
	applyBlockStates();
};
