// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { select } from '@wordpress/data';

/**
 * Blockera dependencies
 */
import { validateSecretKeys } from '@blockera/validator';

export const applyBlockStates = (): void => {
	if ('false' === process.env.CI_ENV) {
		const { getEntity } = select('blockera/data');
		const { blockeraAccount } = window;
		const { account = blockeraAccount } = getEntity('blockera');
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
