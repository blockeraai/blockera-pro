// @flow

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Blockera dependencies
 */
import { Icon } from '@blockera/icons';

const blockeraBackground: Object = {
	config: {
		meshGradientColors: {
			onNative: false,
		},
	},
	onNativeOnStates: false,
	onNativeOnBreakpoints: false,
	onNativeOnInnerBlocks: false,
};

const blockeraBackgroundClip: Object = {
	onNativeOnStates: false,
	onNativeOnBreakpoints: false,
	onNativeOnInnerBlocks: false,
	config: {
		options: [
			{
				label: __('None', 'blockera-pro'),
				value: 'none',
				icon: (
					<Icon
						icon="none-square"
						iconSize={18}
						className="icon-soft-color"
					/>
				),
			},
			{
				label: __('Clip to Padding', 'blockera-pro'),
				value: 'padding-box',
				icon: <Icon icon="clip-padding" iconSize={18} />,
			},
			{
				label: __('Clip to Content', 'blockera-pro'),
				value: 'content-box',
				icon: <Icon icon="clip-content" iconSize={18} />,
			},
			{
				label:
					__('Clip to Text', 'blockera-pro') +
					' [' +
					__('Pro', 'blockera-pro') +
					']',
				value: 'text',
				icon: <Icon icon="clip-text" iconSize={18} />,
				disabled: false,
			},
			{
				label: __('Inherit', 'blockera-pro'),
				value: 'inherit',
				icon: <Icon icon="inherit-square" iconSize={18} />,
			},
		],
	},
};

export const backgroundConfig = {
	blockeraBackground,
	blockeraBackgroundClip,
};
