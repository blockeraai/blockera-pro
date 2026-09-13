// @flow

/**
 * External dependencies
 */
import { dispatch } from '@wordpress/data';
import { addFilter } from '@wordpress/hooks';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Blockera dependencies
 */
import { isEquals, mergeObject } from '@blockera/utils';
import { isAccountLicenseValid } from '@blockera/validator';

export const bootstrapBreakpoints = (): void => {
	const { saveEntityRecord } = dispatch(coreStore);

	const resetBreakpoints = () => {
		addFilter(
			'blockera.breakpoints.defaultRepeaterItemValue',
			'blockeraPro.settings.generalPanel.breakpoints',
			(defaultRepeaterItemValue) => {
				return {
					...defaultRepeaterItemValue,
					native: true,
					deletable: false,
				};
			}
		);

		addFilter(
			'blockera.breakpoints.value',
			'blockeraPro.settings.generalPanel.breakpoints',
			(breakpoints) => {
				breakpoints = Object.fromEntries(
					Object.entries(breakpoints).map(([key, breakpoint]) => {
						if (['desktop', 'tablet', 'mobile'].includes(key)) {
							return [key, breakpoint];
						}

						return [
							key,
							{
								...breakpoint,
								native: true,
								status: false,
							},
						];
					})
				);

				const isEqualsBreakpointValues = () => {
					const {
						blockeraSettings: {
							general: { breakpoints: savedBreakpoints },
						},
					} = window;

					for (const breakpointName in breakpoints) {
						const breakpoint = breakpoints[breakpointName];
						for (const property in breakpoint) {
							if (
								!savedBreakpoints.hasOwnProperty(
									breakpointName
								) ||
								!savedBreakpoints[
									breakpointName
								].hasOwnProperty(property)
							) {
								continue;
							}

							if (
								!isEquals(
									breakpoint[property],
									savedBreakpoints[breakpointName][property]
								)
							) {
								return false;
							}
						}
					}

					return true;
				};

				if (isEqualsBreakpointValues()) {
					return breakpoints;
				}

				saveEntityRecord('blockera/v1', 'settings', {
					...window.blockeraSettings,
					general: {
						...window.blockeraSettings.general,
						breakpoints: mergeObject(
							window.blockeraSettings.general.breakpoints || {},
							breakpoints
						),
					},
				});

				return breakpoints;
			}
		);
	};

	if (!isAccountLicenseValid()) {
		resetBreakpoints();
		return;
	}

	addFilter(
		'blockera.breakpoints.defaultRepeaterItemValue',
		'blockeraPro.settings.generalPanel.breakpoints',
		(defaultRepeaterItemValue) => {
			return {
				...defaultRepeaterItemValue,
				native: false,
			};
		}
	);

	addFilter(
		'blockera.breakpoints.value',
		'blockeraPro.settings.generalPanel.breakpoints',
		(breakpoints) => {
			return Object.fromEntries(
				Object.entries(breakpoints).map(([key, breakpoint]) => {
					return [
						key,
						{
							...breakpoint,
							native: false,
							...(breakpoint.settings.picked
								? { status: true }
								: {}),
						},
					];
				})
			);
		}
	);
};
