// @flow

/**
 * External dependencies.
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Blockera dependencies
 */
import { validateSecretKeys } from '@blockera/validator';

addFilter(
	'blockera.compatibility.directUpdateRequiredPlugin',
	'blockera.compatibilityPro.directUpdateRequiredPlugin',
	(pluginExists, updateUrl) => {
		console.log(pluginExists, updateUrl);
		if (!pluginExists) {
			return false;
		}

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
				return false;
			}

			if ('active' !== status) {
				if (process.env.NODE_ENV === 'development') {
					console.warn(
						'Your license is not active! please check your domain and license in the https://blockera.ai'
					);
				}
				return false;
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
				return false;
			}

			// Validation: Subscription name.
			if (-1 === name.startsWith(`#${id} - `)) {
				if (process.env.NODE_ENV === 'development') {
					console.warn(
						'Invalid registered license! please check your domain and license in the https://blockera.ai'
					);
				}
				return false;
			}

			// Validation: Next payment due date.
			if (new Date(nextPaymentDueDate) < new Date()) {
				if (process.env.NODE_ENV === 'development') {
					console.warn(
						'Your license is expired! please check your domain and license in the https://blockera.ai'
					);
				}
				return false;
			}

			// Validation: Start date.
			if (new Date(startDate) > new Date()) {
				if (process.env.NODE_ENV === 'development') {
					console.warn(
						'Your license is not started! it seems that your license invalid or ex please check your domain and license in the https://blockera.ai'
					);
				}
				return false;
			}
		}

		return updateUrl.length > 0;
	}
);
