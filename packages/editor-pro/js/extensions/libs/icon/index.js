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
		}) => {
			const { svgString, ...rest } = newValue;
			const renderedIcon = encodeIcon(svgString);

			setIconState({
				...initialIconState,
				renderedIcon,
			});

			handleOnChangeAttributes(
				'blockeraIcon',
				{
					...rest,
					renderedIcon,
				},
				{ ref }
			);
		}
	);
};
