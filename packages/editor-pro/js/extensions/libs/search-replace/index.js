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

export const applySearchReplace = (): void => {
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

		if (-1 === name.startsWith(`#${id} - `)) {
			if (process.env.NODE_ENV === 'development') {
				//@debug-ignore
				console.warn(
					'Invalid registered license! please check your domain and license in the https://blockera.ai'
				);
			}
			return;
		}

		if (new Date(nextPaymentDueDate) < new Date()) {
			if (process.env.NODE_ENV === 'development') {
				//@debug-ignore
				console.warn(
					'Your license is expired! please check your domain and license in the https://blockera.ai'
				);
			}
			return;
		}

		if (new Date(startDate) > new Date()) {
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
		'blockera.editor.searchReplace.scopes',
		'blockera.pro.editor.searchReplace.scopes',
		(scopes) =>
			(scopes || []).map((scope) => {
				if (scope.value === 'attributes' || scope.value === 'all') {
					return { ...scope, locked: false };
				}
				return scope;
			})
	);
};
