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
import { applyBlockStates } from './libs';

export const registerEditorExtensions = () => {
	// if (!process.env.CI_ENV) {
	// 	const { blockeraAccount: account } = window;
	// 	const {
	// 		client_id: clientId,
	// 		client_secret: clientSecret,
	// 		access_token: accessToken,
	// 		refresh_token: refreshToken,
	// 		license: {
	// 			id,
	// 			name,
	// 			status,
	// 			startDate,
	// 			licenseKey,
	// 			nextPaymentDueDate,
	// 		},
	// 	} = account || {
	// 		license: {},
	// 	};
	// 	const domain = window.location.origin;
	// 	const subscriptionId = id;

	// 	if (
	// 		!id ||
	// 		!accessToken ||
	// 		!refreshToken ||
	// 		!status ||
	// 		!name ||
	// 		!licenseKey ||
	// 		!nextPaymentDueDate ||
	// 		!startDate ||
	// 		!clientId ||
	// 		!clientSecret
	// 	) {
	// 		console.warn(
	// 			'Invalid registered license! please check your domain and license in the https://blockera.ai'
	// 		);
	// 		return;
	// 	}

	// 	if ('active' !== status) {
	// 		console.warn(
	// 			'Your license is not active! please check your domain and license in the https://blockera.ai'
	// 		);
	// 		return;
	// 	}

	// 	// Start Validation: Secret keys.
	// 	const validated = validateSecretKeys({
	// 		domain,
	// 		clientId,
	// 		clientSecret,
	// 		licenseKey,
	// 		subscriptionId,
	// 	});

	// 	if (!validated) {
	// 		console.warn(
	// 			'Invalid registered license! please check your domain and license in the https://blockera.ai'
	// 		);
	// 		return;
	// 	}

	// 	// Validation: Subscription name.
	// 	if (-1 === name.startsWith(`#${id} - `)) {
	// 		console.warn(
	// 			'Invalid registered license! please check your domain and license in the https://blockera.ai'
	// 		);
	// 		return;
	// 	}

	// 	// Validation: Next payment due date.
	// 	if (new Date(nextPaymentDueDate) < new Date()) {
	// 		console.warn(
	// 			'Your license is expired! please check your domain and license in the https://blockera.ai'
	// 		);
	// 		return;
	// 	}

	// 	// Validation: Start date.
	// 	if (new Date(startDate) > new Date()) {
	// 		console.warn(
	// 			'Your license is not started! it seems that your license invalid or ex please check your domain and license in the https://blockera.ai'
	// 		);
	// 		return;
	// 	}
	// }

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
