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
import { isAccountLicenseValid } from '@blockera/validator';

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

	if (!isAccountLicenseValid()) {
		resetCacheData();
	}
};
