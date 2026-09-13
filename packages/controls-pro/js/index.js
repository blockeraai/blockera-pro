// @flow

/**
 * Blockera dependencies
 */
import { isAccountLicenseValid } from '@blockera/validator';

/**
 * Internal dependencies
 */
import { applyBackgroundControlHooks } from './background-control/apply';
import { applyTransitionControlHooks } from './transition-control/apply';

export const applyControls = () => {
	if (!isAccountLicenseValid()) {
		return;
	}

	applyBackgroundControlHooks();
	applyTransitionControlHooks();
};
