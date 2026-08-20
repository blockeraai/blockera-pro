// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Blockera dependencies
 */
import { validateSecretKeys } from '@blockera/validator';

export const bootstrapGeneralPanel = () => {
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
		'blockera.admin.panel.settings.config',
		'blockera.pro.admin.bootstrapper',
		(config: Object): Object => {
			return {
				...config,
				general: {
					...config.general,
					restrictBlockVisibility: {
						...config.general.restrictBlockVisibility,
						onNative: false,
						isParentActive: true,
						config: {
							...config.general.restrictBlockVisibility.config,
							userRole: {
								...config.general.restrictBlockVisibility.config
									.userRole,
								onNative: false,
							},
						},
					},
					restrictBlockVisibilityByPostType: {
						...config.general.restrictBlockVisibilityByPostType,
						onNative: false,
						isParentActive: true,
						config: {
							...config.general.restrictBlockVisibilityByPostType
								.config,
							postType: {
								...config.general
									.restrictBlockVisibilityByPostType.config
									.postType,
								onNative: false,
							},
						},
					},
				},
			};
		}
	);

	addFilter(
		'blockera.admin.general.panel.disableRestrictBlockVisibility.onChange',
		'blockera.pro.admin.general.panel.onChangeBlockVisibilityControl',
		(
			noop,
			{
				setHasUpdates,
				generalSettings,
				setSettings,
				settings,
				savedGeneralSettings,
			}
		) => {
			return (checked: boolean) => {
				setHasUpdates(
					checked !==
						savedGeneralSettings.disableRestrictBlockVisibility
				);

				setSettings({
					...settings,
					general: {
						...generalSettings,
						disableRestrictBlockVisibility: checked,
					},
				});
			};
		}
	);

	addFilter(
		'blockera.admin.general.panel.disableRestrictBlockVisibilityByPostType.onChange',
		'blockera.pro.admin.general.panel.onChangeBlockVisibilityByPostTypeControl',
		(
			noop,
			{
				setHasUpdates,
				generalSettings,
				setSettings,
				settings,
				savedGeneralSettings,
			}
		) => {
			return (checked: boolean) => {
				setHasUpdates(
					checked !==
						savedGeneralSettings.disableRestrictBlockVisibilityByPostType
				);

				setSettings({
					...settings,
					general: {
						...generalSettings,
						disableRestrictBlockVisibilityByPostType: checked,
					},
				});
			};
		}
	);

	addFilter(
		'blockera.admin.general.panel.restrictBlockVisibility.userRole.onChange',
		'blockera.pro.admin.general.panel.onChangeUserRole',
		(
			noop,
			{
				setHasUpdates,
				generalSettings,
				id,
				setSettings,
				settings,
				savedGeneralSettings,
			}
		) => {
			return (checked: boolean) => {
				setHasUpdates(
					checked !== savedGeneralSettings.allowedUserRoles[id]
				);

				setSettings({
					...settings,
					general: {
						...generalSettings,
						allowedUserRoles: {
							...generalSettings.allowedUserRoles,
							[id]: checked,
						},
					},
				});
			};
		}
	);

	addFilter(
		'blockera.admin.general.panel.restrictBlockVisibilityByPostType.postType.onChange',
		'blockera.pro.admin.general.panel.onChangePostType',
		(
			noop,
			{
				setHasUpdates,
				generalSettings,
				id,
				setSettings,
				settings,
				savedGeneralSettings,
			}
		) => {
			return (checked: boolean) => {
				setHasUpdates(
					checked !== savedGeneralSettings.allowedPostTypes[id]
				);

				setSettings({
					...settings,
					general: {
						...generalSettings,
						allowedPostTypes: {
							...generalSettings.allowedPostTypes,
							[id]: checked,
						},
					},
				});
			};
		}
	);
};

export { bootstrapBreakpoints } from './breakpoints';
