// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

export const restrictBlockVisibilityOnChangeUserRole = () => {
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
