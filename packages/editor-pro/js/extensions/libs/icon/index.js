// @flow

/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

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
			const { svgString, uploadSVG, ...rest } = newValue;
			const encodedIconObj = encodeIcon(svgString, {
				hasInlineStyle: true,
				color: effectiveItems?.blockeraIconColor?.value,
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
						alt: uploadSVG?.title
							? sprintf(
									// translators: %s is the icon name.
									__('%s Icon', 'blockera'),
									uploadSVG.title.replaceAll('-', ' ')
							  )
							: '',
					},
				}
			);
		}
	);
};
