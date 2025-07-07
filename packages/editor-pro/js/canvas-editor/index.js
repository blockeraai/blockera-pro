// @flow

/**
 * External dependencies
 */
import { select } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import { addFilter } from '@wordpress/hooks';

/**
 * Blockera dependencies
 */
import { validateSecretKeys } from '@blockera/validator';

export const bootstrapCanvasEditor = () => {
	if ('false' === process.env.CI_ENV) {
		const resetBreakpoints = () => {
			addFilter(
				'blockera.breakpoints.defaultRepeaterItemValue',
				'blockeraPro.canvasEditor',
				(defaultRepeaterItemValue) => {
					return {
						...defaultRepeaterItemValue,
						native: true,
					};
				}
			);

			addFilter(
				'blockera.breakpoints',
				'blockeraPro.canvasEditor',
				(breakpoints) => {
					breakpoints = Object.fromEntries(
						Object.entries(breakpoints).map(([key, breakpoint]) => {
							if (['desktop', 'tablet', 'mobile'].includes(key)) {
								return [key, breakpoint];
							}

							return [
								key,
								{
									...breakpoint,
									native: true,
									status: false,
									settings: {
										...breakpoint.settings,
										picked: false,
									},
								},
							];
						})
					);

					const { getCurrentUser } = select('core');
					const { id: userId } = getCurrentUser();
					console.log(userId);

					apiFetch({
						path: '/blockera/v1/users',
						method: 'POST',
						headers: {
							'X-Blockera-Nonce': blockeraEditorNonce,
						},
						data: {
							user_id: userId,
							settings: {
								breakpoints,
							},
						},
					});

					return breakpoints;
				}
			);
		};

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
			return resetBreakpoints();
		}

		if ('active' !== status) {
			if (process.env.NODE_ENV === 'development') {
				console.warn(
					'Your license is not active! please check your domain and license in the https://blockera.ai'
				);
			}
			return resetBreakpoints();
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
			return resetBreakpoints();
		}

		// Validation: Subscription name.
		if (-1 === name.startsWith(`#${id} - `)) {
			if (process.env.NODE_ENV === 'development') {
				console.warn(
					'Invalid registered license! please check your domain and license in the https://blockera.ai'
				);
			}
			return resetBreakpoints();
		}

		// Validation: Next payment due date.
		if (new Date(nextPaymentDueDate) < new Date()) {
			if (process.env.NODE_ENV === 'development') {
				console.warn(
					'Your license is expired! please check your domain and license in the https://blockera.ai'
				);
			}
			return resetBreakpoints();
		}

		// Validation: Start date.
		if (new Date(startDate) > new Date()) {
			if (process.env.NODE_ENV === 'development') {
				console.warn(
					'Your license is not started! it seems that your license invalid or ex please check your domain and license in the https://blockera.ai'
				);
			}
			return resetBreakpoints();
		}
	}

	addFilter(
		'blockera.breakpoints.defaultRepeaterItemValue',
		'blockeraPro.canvasEditor',
		(defaultRepeaterItemValue) => {
			return {
				...defaultRepeaterItemValue,
				native: false,
			};
		}
	);

	addFilter(
		'blockera.breakpoints',
		'blockeraPro.canvasEditor',
		(breakpoints) => {
			return Object.fromEntries(
				Object.entries(breakpoints).map(([key, breakpoint]) => {
					return [
						key,
						{
							...breakpoint,
							native: false,
						},
					];
				})
			);
		}
	);
};
