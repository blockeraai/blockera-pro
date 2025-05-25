// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import {
	proPanelTabs,
	accountHasHeader,
	accountShowButtons,
	filterCallToActions,
	filterAvailableTabs,
	filteredIgnoredPanelTabs,
	accountDescriptionComponent,
	accountActivePanelComponent,
	filteredDashboardAvailablePages,
	filteredDashboardProfileComponent,
	restrictBlockVisibilityOnChangeUserRole,
} from './panels';

const initializeBlockeraProAdmin = () => {
	return () => {
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
							config: {
								...config.general.restrictBlockVisibility
									.config,
								userRole: {
									...config.general.restrictBlockVisibility
										.config.userRole,
									onNative: false,
								},
							},
						},
						restrictBlockVisibilityByPostType: {
							...config.general.restrictBlockVisibilityByPostType,
							onNative: false,
							config: {
								...config.general
									.restrictBlockVisibilityByPostType.config,
								postType: {
									...config.general
										.restrictBlockVisibilityByPostType
										.config.postType,
									onNative: false,
								},
							},
						},
					},
				};
			}
		);

		filteredIgnoredPanelTabs();

		filterCallToActions();
		filterAvailableTabs();

		filteredDashboardAvailablePages();
		filteredDashboardProfileComponent();

		proPanelTabs();
		accountHasHeader();
		accountActivePanelComponent();
		accountDescriptionComponent();
		accountShowButtons();

		restrictBlockVisibilityOnChangeUserRole();
	};
};

/**
 * Initialize blockera react application.
 */
addFilter(
	'blockera.bootstrapper.before.domReady',
	'blockera.pro.admin.bootstrap',
	initializeBlockeraProAdmin
);
