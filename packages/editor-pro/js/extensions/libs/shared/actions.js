// @flow

/**
 * External dependencies
 */
import { select } from '@wordpress/data';
import { addAction } from '@wordpress/hooks';

/**
 * Blockera dependencies
 */
import { localStorage } from '@blockera/storage';
import { validateSecretKeys } from '@blockera/validator';

const STORE_NAME = 'blockera/extensions/config';

export const clearCache = (): void => {
	const resetCacheData = () => {
		addAction(
			'blockera.editor.extensions.sharedExtension.blockSupports.cacheData',
			'blockera',
			(cacheKey: string, props: Object): void => {
				const { getExtensions } = select(STORE_NAME);
				const extensions = getExtensions(props.name);

				localStorage.setJSON(cacheKey, extensions);
			}
		);
	};

	if ('false' === process.env.CI_ENV) {
		const { blockeraAccount: account } = window;
		const {
			client_id: clientId,
			client_secret: clientSecret,
			access_token: accessToken,
			refresh_token: refreshToken,
			license: {
				id,
				type,
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

			resetCacheData();

			return;
		}

		if ('active' !== status) {
			if (process.env.NODE_ENV === 'development') {
				//@debug-ignore
				console.warn(
					'Your license is not active! please check your domain and license in the https://blockera.ai'
				);
			}

			resetCacheData();

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

			resetCacheData();

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

			resetCacheData();

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

			resetCacheData();

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

			resetCacheData();
		}
	}
};
