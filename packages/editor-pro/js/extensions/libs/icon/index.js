// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { encodeCustomSvgIcon } from './custom-icon-utils';

export const applyIconExtensionHook = () => {
	addFilter(
		'blockera.featureIcon.extension.uploadSVG.onChangeHandler',
		'blockera-pro/icon/uploadSVG',
		(payload) => {
			if (!payload || typeof payload !== 'object') {
				return payload;
			}

			const { ref, newValue, effectiveItems, handleOnChangeAttributes } =
				payload;

			if (!newValue?.svgString || !handleOnChangeAttributes) {
				return payload;
			}

			// Preserve custom SVG markup exactly; only encode for storage/transport.
			const renderedIcon = encodeCustomSvgIcon(newValue.svgString);

			handleOnChangeAttributes(
				'blockeraIcon',
				{
					...newValue,
					icon: '',
					library: '',
					renderedIcon: renderedIcon.encodedIcon,
				},
				{
					ref,
					effectiveItems,
				}
			);

			return payload;
		}
	);
};
