// @flow

/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import {
	buildCustomIconDataUrl,
	encodeCustomSvgIcon,
	isStandaloneIconBlock,
} from './custom-icon-utils';

export const applyIconExtensionHook = () => {
	addFilter(
		'blockera.featureIcon.extension.uploadSVG.onChangeHandler',
		'blockera-pro/icon/uploadSVG',
		(payload) => {
			if (!payload || typeof payload !== 'object') {
				return payload;
			}

			const {
				ref,
				newValue,
				effectiveItems,
				handleOnChangeAttributes,
				blockName,
				isIconBlock,
			} = payload;

			if (!newValue?.svgString || !handleOnChangeAttributes) {
				return payload;
			}

			// Preserve custom SVG markup exactly; only encode for storage/transport.
			const renderedIcon = encodeCustomSvgIcon(newValue.svgString);
			const shouldSetIconBlockUrl =
				isIconBlock ?? isStandaloneIconBlock(blockName);

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
					effectiveItems: {
						...effectiveItems,
						...(shouldSetIconBlockUrl
							? {
									url: buildCustomIconDataUrl(
										newValue.svgString
									),
									alt: newValue.uploadSVG?.title
										? sprintf(
												// translators: %s is the icon name.
												__('%s Icon', 'blockera'),
												newValue.uploadSVG.title.replaceAll(
													'-',
													' '
												)
										  )
										: '',
							  }
							: {}),
					},
				}
			);

			return payload;
		}
	);
};
