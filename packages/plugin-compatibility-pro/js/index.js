// @flow

/**
 * External dependencies.
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Blockera dependencies
 */
import { isAccountLicenseValid } from '@blockera/validator';

addFilter(
	'blockera.compatibility.directUpdateRequiredPlugin',
	'blockera.compatibilityPro.directUpdateRequiredPlugin',
	(pluginExists, updateUrl) => {
		if (0 === pluginExists) {
			return false;
		}

		if (!isAccountLicenseValid()) {
			return false;
		}

		return updateUrl.length > 0;
	}
);
