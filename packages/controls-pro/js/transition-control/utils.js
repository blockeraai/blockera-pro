// @flow
/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

export const getTransitionTypeOptions = function (): Array<Object> {
	return [
		{
			type: 'optgroup',
			label: __('Common Transitions', 'blockera-pro'),
			options: [
				{
					label: __('All Properties', 'blockera-pro'),
					value: 'all',
				},
				{
					label: __('Opacity', 'blockera-pro'),
					value: 'opacity',
				},
				{
					label: __('Margin', 'blockera-pro'),
					value: 'margin',
				},
				{
					label: __('Padding', 'blockera-pro'),
					value: 'padding',
				},
				{
					label: __('Border', 'blockera-pro'),
					value: 'border',
				},
				{
					label: __('Transform', 'blockera-pro'),
					value: 'transform',
				},
				{
					label: __('Filter', 'blockera-pro'),
					value: 'filter',
				},
				{
					label: __('Flex', 'blockera-pro'),
					value: 'flex',
				},
			],
		},
		{
			type: 'optgroup',
			label: __('Background Transitions', 'blockera-pro'),
			options: [
				{
					label: __('Background Color', 'blockera-pro'),
					value: 'background-color',
				},
				{
					label: __('Background Position', 'blockera-pro'),
					value: 'background-position',
				},
				{
					label: __('Text Shadow', 'blockera-pro'),
					value: 'text-shadow',
				},
				{
					label: __('Box Shadow', 'blockera-pro'),
					value: 'box-shadow',
				},
			],
		},
		{
			type: 'optgroup',
			label: __('Size Transitions', 'blockera-pro'),
			options: [
				{
					label: __('Width', 'blockera-pro'),
					value: 'width',
				},
				{
					label: __('Height', 'blockera-pro'),
					value: 'height',
				},
				{
					label: __('Max Height', 'blockera-pro'),
					value: 'max-height',
				},
				{
					label: __('Max Width', 'blockera-pro'),
					value: 'max-width',
				},
				{
					label: __('Min Height', 'blockera-pro'),
					value: 'min-height',
				},
				{
					label: __('Min Width', 'blockera-pro'),
					value: 'min-width',
				},
			],
		},
		{
			type: 'optgroup',
			label: __('Borders Transitions', 'blockera-pro'),
			options: [
				{
					label: __('Border Radius', 'blockera-pro'),
					value: 'border-radius',
				},
				{
					label: __('Border Color', 'blockera-pro'),
					value: 'border-color',
				},
				{
					label: __('Border Width', 'blockera-pro'),
					value: 'border-width',
				},
			],
		},
		{
			type: 'optgroup',
			label: __('Typography Transitions', 'blockera-pro'),
			options: [
				{
					label: __('Font Color', 'blockera-pro'),
					value: 'color',
				},
				{
					label: __('Font Size', 'blockera-pro'),
					value: 'font-size',
				},
				{
					label: __('Line Height', 'blockera-pro'),
					value: 'line-height',
				},
				{
					label: __('Letter Spacing', 'blockera-pro'),
					value: 'letter-spacing',
				},
				{
					label: __('Text Indent', 'blockera-pro'),
					value: 'text-indent',
				},
				{
					label: __('Word Spacing', 'blockera-pro'),
					value: 'word-spacing',
				},
				{
					label: __('Font Variation', 'blockera-pro'),
					value: 'font-variation-settings',
				},
				{
					label: __('Text Stroke Color', 'blockera-pro'),
					value: '-webkit-text-stroke-color',
				},
			],
		},
		{
			type: 'optgroup',
			label: __('Position Transitions', 'blockera-pro'),
			options: [
				{
					label: __('Top', 'blockera-pro'),
					value: 'top',
				},
				{
					label: __('Right', 'blockera-pro'),
					value: 'right',
				},
				{
					label: __('Bottom', 'blockera-pro'),
					value: 'bottom',
				},
				{
					label: __('Left', 'blockera-pro'),
					value: 'left',
				},
				{
					label: __('Z-Index', 'blockera-pro'),
					value: 'z-index',
				},
			],
		},
		{
			type: 'optgroup',
			label: __('Margin Transitions', 'blockera-pro'),
			options: [
				{
					label: __('Margin Top', 'blockera-pro'),
					value: 'margin-top',
				},
				{
					label: __('Margin Right', 'blockera-pro'),
					value: 'margin-right',
				},
				{
					label: __('Margin Bottom', 'blockera-pro'),
					value: 'margin-bottom',
				},
				{
					label: __('Margin Left', 'blockera-pro'),
					value: 'margin-left',
				},
			],
		},
		{
			type: 'optgroup',
			label: __('Padding Transitions', 'blockera-pro'),
			options: [
				{
					label: __('Padding Top', 'blockera-pro'),
					value: 'padding-top',
				},
				{
					label: __('Padding Right', 'blockera-pro'),
					value: 'padding-right',
				},
				{
					label: __('Padding Bottom', 'blockera-pro'),
					value: 'padding-bottom',
				},
				{
					label: __('Padding Left', 'blockera-pro'),
					value: 'padding-left',
				},
			],
		},
		{
			type: 'optgroup',
			label: __('Flex Transitions', 'blockera-pro'),
			options: [
				{
					label: __('Flex Grow', 'blockera-pro'),
					value: 'flex-grow',
				},
				{
					label: __('Flex Shrink', 'blockera-pro'),
					value: 'flex-shrink',
				},
				{
					label: __('Flex Basis', 'blockera-pro'),
					value: 'flex-basis',
				},
			],
		},
	];
};

export const getTransitionTimingOptions = function (): Array<Object> {
	return [
		{
			type: 'optgroup',
			label: __('Default Timings', 'blockera-pro'),
			options: [
				{
					label: __('Linear', 'blockera-pro'),
					value: 'linear',
				},
				{
					label: __('Ease', 'blockera-pro'),
					value: 'ease',
				},
				{
					label: __('Ease In', 'blockera-pro'),
					value: 'ease-in',
				},
				{
					label: __('Ease Out', 'blockera-pro'),
					value: 'ease-out',
				},
				{
					label: __('Ease In Out', 'blockera-pro'),
					value: 'ease-in-out',
				},
			],
		},
		{
			type: 'optgroup',
			label: __('Ease In Timings', 'blockera-pro'),
			options: [
				{
					label: __('Ease In Quad', 'blockera-pro'),
					value: 'ease-in-quad',
				},
				{
					label: __('Ease In Cubic', 'blockera-pro'),
					value: 'ease-in-cubic',
				},
				{
					label: __('Ease In Quart', 'blockera-pro'),
					value: 'ease-in-cubic',
				},
				{
					label: __('Ease In Quint', 'blockera-pro'),
					value: 'ease-in-quint',
				},
				{
					label: __('Ease In Sine', 'blockera-pro'),
					value: 'ease-in-sine',
				},
				{
					label: __('Ease In Expo', 'blockera-pro'),
					value: 'ease-in-expo',
				},
				{
					label: __('Ease In Circ', 'blockera-pro'),
					value: 'ease-in-circ',
				},
				{
					label: __('Ease In Back', 'blockera-pro'),
					value: 'ease-in-back',
				},
			],
		},
		{
			type: 'optgroup',
			label: __('Ease Out Timings', 'blockera-pro'),
			options: [
				{
					label: __('Ease Out Quad', 'blockera-pro'),
					value: 'ease-out-quad',
				},
				{
					label: __('Ease Out Cubic', 'blockera-pro'),
					value: 'ease-out-cubic',
				},
				{
					label: __('Ease Out Quart', 'blockera-pro'),
					value: 'ease-out-quart',
				},
				{
					label: __('Ease Out Quint', 'blockera-pro'),
					value: 'ease-out-quint',
				},
				{
					label: __('Ease Out Sine', 'blockera-pro'),
					value: 'ease-out-sine',
				},
				{
					label: __('Ease Out Expo', 'blockera-pro'),
					value: 'ease-out-expo',
				},
				{
					label: __('Ease Out Circ', 'blockera-pro'),
					value: 'ease-out-circ',
				},
				{
					label: __('Ease Out Back', 'blockera-pro'),
					value: 'ease-out-back',
				},
			],
		},
		{
			type: 'optgroup',
			label: __('Ease In Out Timings', 'blockera-pro'),
			options: [
				{
					label: __('Ease In Out Quad', 'blockera-pro'),
					value: 'ease-in-out-quad',
				},
				{
					label: __('Ease In Out Cubic', 'blockera-pro'),
					value: 'ease-in-out-cubic',
				},
				{
					label: __('Ease In Out Quart', 'blockera-pro'),
					value: 'ease-in-out-quart',
				},
				{
					label: __('Ease In Out Quint', 'blockera-pro'),
					value: 'ease-in-out-quint',
				},
				{
					label: __('Ease In Out Sine', 'blockera-pro'),
					value: 'ease-in-out-sine',
				},
				{
					label: __('easeInOutExpo', 'blockera-pro'),
					value: 'ease-in-out-expo',
				},
				{
					label: __('Ease In Out Circ', 'blockera-pro'),
					value: 'ease-in-out-circ',
				},
				{
					label: __('Ease In Out Back', 'blockera-pro'),
					value: 'ease-in-out-back',
				},
			],
		},
	];
};
