// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

export const applyIconExtensionHook = () => {
	addFilter(
		'blockera.featureIcon.extension.uploadSVG.onChangeHandler',
		'blockera-pro/icon/uploadSVG',
		({
			ref,
			newValue,
			encodeIcon,
			effectiveItems,
			handleOnChangeAttributes,
		}) => {
			const { svgString, ...rest } = newValue;
			const encodedIconObj = encodeIcon(svgString, true);

			handleOnChangeAttributes(
				'blockeraIcon',
				{
					...rest,
					icon: '',
					library: '',
					renderedIcon: encodedIconObj.encodedIcon,
				},
				{
					ref,
					effectiveItems: {
						...effectiveItems,
						url: 'data:image/svg+xml;utf8,' + encodedIconObj.icon,
						alt: rest?.uploadSVG?.title ?? '',
					},
				}
			);
		}
	);
};
