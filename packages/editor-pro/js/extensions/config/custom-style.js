// @flow

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import type { FeatureConfig } from '../types';

const blockeraCustomCSS: FeatureConfig = {
	show: true,
	force: true,
	status: true,
	label: __('Custom CSS Code', 'blockera'),
	isActiveOnFree: true,
	isActiveOnStates: false,
	isActiveOnInnerBlocks: false,
	isActiveOnBreakpoints: false,
};

export const customStyleConfig = {
	initialOpen: false,
	blockeraCustomCSS,
};
