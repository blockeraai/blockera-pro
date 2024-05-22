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
					checked !==
						savedGeneralSettings.allowedUserRoles[id].checked
				);

				setSettings({
					...settings,
					general: {
						...generalSettings,
						allowedUserRoles: {
							...generalSettings.allowedUserRoles,
							[id]: {
								...generalSettings.allowedUserRoles[id],
								checked,
							},
						},
					},
				});
			};
		}
	);
};
