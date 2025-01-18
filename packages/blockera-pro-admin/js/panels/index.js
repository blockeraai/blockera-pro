// @flow

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import type { MixedElement } from 'react';
import { addFilter } from '@wordpress/hooks';
/**
 * Blockera dependencies
 */
import { getUrlParams } from '@blockera/utils';
import { ConnectWithBlockera } from '@blockera/auth-pro';

const isConnected = getUrlParams('connectedWithYourAccount');

export * from './general';
export * from './dashboard';

export const filteredIgnoredPanelTabs = (): void => {
	addFilter(
		'blockera.admin.panelHeader.ignoredTabs',
		'blockera.pro.admin.panelHeader.ignoredTabs',
		(tabs: Array<string>): Array<string> => {
			return [...tabs, 'account'];
		}
	);
};

export const proPanelTabs = (): void => {
	addFilter(
		'blockera.admin.panels',
		'blockera.pro.admin.panels',
		(panels: Array<string>): Array<string> => {
			return [...panels, 'account'];
		}
	);
};

export const accountHasHeader = (): void => {
	addFilter(
		'blockera.admin.panel.account.hasHeader',
		'blockera.pro.admin.panel.account.hasHeader',
		(): boolean => false
	);
};

export const accountActivePanelComponent = (): void => {
	addFilter(
		'blockera.admin.panel.account.activePanelComponent',
		'blockera.pro.admin.panel.account.activePanelComponent',
		(): MixedElement => <ConnectWithBlockera isConnected={isConnected} />
	);
};

export const accountDescriptionComponent = (): void => {
	addFilter(
		'blockera.admin.panel.account.description',
		'blockera.pro.admin.panel.account.description',
		(description: string): string =>
			isConnected
				? description
				: __('Lets connect Blockera with your account.', 'blockera')
	);
};

export const accountShowButtons = (): void => {
	addFilter(
		'blockera.admin.panel.account.showButtons',
		'blockera.pro.admin.panel.account.showButtons',
		(): boolean => false
	);
};
