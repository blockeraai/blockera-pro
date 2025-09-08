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
			initialIconState,
			handleOnChangeAttributes,
			effectiveItems,
		}) => {
			const { svgString, ...rest } = newValue;
			const renderedIcon = encodeIcon(svgString);

			setIconState({
				...initialIconState,
				icon: {
					icon: '',
					library: '',
					uploadSVG: renderedIcon.encodedIcon,
					renderedIcon: renderedIcon.encodedIcon,
				},
			});

			handleOnChangeAttributes(
				'blockeraIcon',
				{
					...rest,
					icon: '',
					library: '',
					uploadSVG: renderedIcon.encodedIcon,
					renderedIcon: renderedIcon.encodedIcon,
				},
				{
					ref,
					effectiveItems: {
						...effectiveItems,
						url: 'data:image/svg+xml;utf8,' + renderedIcon.icon,
						alt: rest?.uploadSVG?.title ?? '',
					},
				}
			);
		}
	);
};
