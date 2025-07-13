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
	bootstrapBreakpoints,
	bootstrapGeneralPanel,
	filteredIgnoredPanelTabs,
	accountDescriptionComponent,
	accountActivePanelComponent,
	filteredDashboardAvailablePages,
	filteredDashboardProfileComponent,
} from './panels';

const initializeBlockeraProAdmin = () => {
	return () => {
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

		bootstrapBreakpoints();
		bootstrapGeneralPanel();
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
