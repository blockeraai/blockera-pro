// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Blockera dependencies
 */
import { mergeObject } from '@blockera/utils';
import { validateSecretKeys } from '@blockera/validator';

/**
 * Internal dependencies
 */
import * as config from './config';
import { applyBlockStates, applySearchReplace, clearCache } from './libs';

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
	if ('false' === process.env.CI_ENV) {
		const { blockeraAccount: account } = window;
		const {
			client_id: clientId,
			client_secret: clientSecret,
			access_token: accessToken,
			refresh_token: refreshToken,
			license: {
				id,
				name,
				type,
				status,
				startDate,
				licenseKey,
				nextPaymentDueDate,
			},
		} = account || {
			license: {},
		};
		const domain = window.location.origin;
		const subscriptionId = id;

		if (
			!id ||
			!accessToken ||
			!refreshToken ||
			!status ||
			!name ||
			!licenseKey ||
			!nextPaymentDueDate ||
			!startDate ||
			!clientId ||
			!clientSecret
		) {
			if (process.env.NODE_ENV === 'development') {
				//@debug-ignore
				console.warn(
					'Invalid registered license! please check your domain and license in the https://blockera.ai'
				);
			}
			return;
		}

		if ('active' !== status) {
			if (process.env.NODE_ENV === 'development') {
				//@debug-ignore
				console.warn(
					'Your license is not active! please check your domain and license in the https://blockera.ai'
				);
			}
			return;
		}

		// Start Validation: Secret keys.
		const validated = validateSecretKeys({
			domain,
			clientId,
			clientSecret,
			licenseKey,
			subscriptionId,
		});

		if (!validated) {
			if (process.env.NODE_ENV === 'development') {
				//@debug-ignore
				console.warn(
					'Invalid registered license! please check your domain and license in the https://blockera.ai'
				);
			}
			return;
		}

		// Validation: Subscription name.
		if (-1 === name.startsWith(`#${id} - `)) {
			if (process.env.NODE_ENV === 'development') {
				//@debug-ignore
				console.warn(
					'Invalid registered license! please check your domain and license in the https://blockera.ai'
				);
			}
			return;
		}

		// Validation: Next payment due date.
		if (
			new Date(nextPaymentDueDate) < new Date() &&
			'subscription' === type
		) {
			if (process.env.NODE_ENV === 'development') {
				//@debug-ignore
				console.warn(
					'Your license is expired! please check your domain and license in the https://blockera.ai'
				);
			}
			return;
		}

		// Validation: Start date.
		if (new Date(startDate) > new Date() && 'subscription' === type) {
			if (process.env.NODE_ENV === 'development') {
				//@debug-ignore
				console.warn(
					'Your license is not started! it seems that your license invalid or ex please check your domain and license in the https://blockera.ai'
				);
			}
			return;
		}
	}

	addFilter(
		'blockera.editor.components.editorFeatureWrapper.editorStoreParams',
		'blockeraPro.provide.editorStoreParams',
		(params: Object) => ({
			...params,
			list: true,
		})
	);

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
	applySearchReplace();
};
