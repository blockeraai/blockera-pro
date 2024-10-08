// @flow

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { restrictBlockVisibilityOnChangeUserRole } from './panels';

const initializeBlockeraProAdmin = () => {
	return () => {
		addFilter(
			'blockera.admin.panel.settings.config',
			'blockera.pro.admin.bootstrapper',
			(config: Object): Object => {
				return {
					...config,
					general: {
						...config.general,
						restrictBlockVisibility: {
							...config.general.restrictBlockVisibility,
							isActiveOnFree: true,
							config: {
								...config.general.restrictBlockVisibility
									.config,
								userRole: {
									...config.general.restrictBlockVisibility
										.config.userRole,
									isActiveOnFree: true,
								},
							},
						},
					},
				};
			}
		);

		restrictBlockVisibilityOnChangeUserRole();
	};
};

/**
 * Initialize blockera react application.
 */
addFilter(
	'blockera.bootstrapper.before.domReady',
	'blockera.pro.admin.bootstrap',
	initializeBlockeraProAdmin
);
