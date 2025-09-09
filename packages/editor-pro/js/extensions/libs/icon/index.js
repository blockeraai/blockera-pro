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
			setIconState,
			effectiveItems,
			handleOnChangeAttributes,
		}) => {
			const { svgString, ...rest } = newValue;
			const encodedIconObj = encodeIcon(svgString, true);

			setIconState((prev) => {
				return {
					...prev,
					icon: {
						icon: '',
						library: '',
						renderedIcon: encodedIconObj.encodedIcon,
					},
				};
			});

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
