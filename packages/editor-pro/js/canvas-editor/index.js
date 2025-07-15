// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Blockera dependencies
 */
import { validateSecretKeys } from '@blockera/validator';

export const bootstrapCanvasEditor = () => {
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
				console.warn(
					'Invalid registered license! please check your domain and license in the https://blockera.ai'
				);
			}
			return;
		}

		if ('active' !== status) {
			if (process.env.NODE_ENV === 'development') {
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
				console.warn(
					'Invalid registered license! please check your domain and license in the https://blockera.ai'
				);
			}
			return;
		}

		// Validation: Subscription name.
		if (-1 === name.startsWith(`#${id} - `)) {
			if (process.env.NODE_ENV === 'development') {
				console.warn(
					'Invalid registered license! please check your domain and license in the https://blockera.ai'
				);
			}
			return;
		}

		// Validation: Next payment due date.
		if (new Date(nextPaymentDueDate) < new Date()) {
			if (process.env.NODE_ENV === 'development') {
				console.warn(
					'Your license is expired! please check your domain and license in the https://blockera.ai'
				);
			}
			return;
		}

		// Validation: Start date.
		if (new Date(startDate) > new Date()) {
			if (process.env.NODE_ENV === 'development') {
				console.warn(
					'Your license is not started! it seems that your license invalid or ex please check your domain and license in the https://blockera.ai'
				);
			}
			return;
		}
	}

	addFilter(
		'blockera.editor.canvasEditor.bootstrap.breakpoints',
		'blockeraPro.editorPro.canvasEditor.bootstrap',
		(breakpoints) => {
			return Object.fromEntries(
				Object.entries(breakpoints).map(([key, breakpoint]) => [
					key,
					{
						...breakpoint,
						...('' === breakpoint.type ? { type: key } : {}),
					},
				])
			);
		}
	);
};
