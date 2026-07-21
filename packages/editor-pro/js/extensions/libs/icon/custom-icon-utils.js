// @flow

/**
 * Local copies of @blockera/feature-icon helpers.
 * Bundled here so editor-pro does not depend on the feature-icon webpack global
 * (blockera-pro loads before feature-icon in the editor asset list).
 */

/** Standalone icon blocks (not inline icon on text/button blocks). */
export const isStandaloneIconBlock = (blockName?: string): boolean =>
	blockName === 'core/icon';

/**
 * Encode custom SVG for storage without stroke/fill normalization.
 *
 * @param {string} svgString Raw SVG markup.
 * @return {{ encodedIcon: string, icon: string }} Base64 + URI-encoded forms.
 */
export const encodeCustomSvgIcon = (
	svgString: string
): { encodedIcon: string, icon: string } => {
	const markup = svgString?.trim() || '';

	if (!markup) {
		return { encodedIcon: '', icon: '' };
	}

	return {
		encodedIcon: btoa(unescape(encodeURIComponent(markup))),
		icon: encodeURIComponent(markup),
	};
};
