// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Blockera dependencies
 */
import { syncProProductLicense } from '@blockera/blockera-pro/js/register-product-license.js';

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
		syncProProductLicense();

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
