// @flow

/**
 * External dependencies
 */
import { select } from '@wordpress/data';

/**
 * Blockera dependencies
 */
import { updateConfig } from '@blockera/utils';

/**
 * Internal dependencies
 */
import * as config from './config';
import { applyBlockStates } from './libs';
import * as innerBlocksConfig from './inner-blocks-config';

export const registerEditorExtensions = () => {
	const STORE_NAME = 'blockera-core/extensions/config';
	const { getExtensions } = select(STORE_NAME) || {};

	if ('function' === typeof getExtensions) {
		// Overriding master blocks definitions.
		Object.entries(getExtensions()).forEach(
			([featureName, featureConfig]): void => {
				if (!config[featureName]) {
					Object.entries(featureConfig).forEach(
						([subFeatureName, subFeatureConfig]) => {
							return updateConfig(featureName, {
								...featureConfig,
								[subFeatureName]: {
									...subFeatureConfig,
									isActiveOnStatesOnFree: true,
									isActiveOnBreakpointsOnFree: true,
									isActiveOnInnerBlocksOnFree: true,
								},
							});
						}
					);

					return;
				}

				return updateConfig(featureName, config[featureName]);
			}
		);
	}

	// Overriding inner blocks definitions.
	Object.entries(innerBlocksConfig).forEach(([featureName, featureConfig]) =>
		updateConfig(featureName, featureConfig)
	);
};

export const applyExtensions = (): void => {
	applyBlockStates();
};
