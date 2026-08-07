import { goTo } from '@blockera/dev-cypress/js/helpers';

const SPEC_LABEL = 'plugin-compatibility';

const resolveTestUrl = (path) => {
	const testURL = (Cypress.env('testURL') || 'http://localhost:8888').replace(
		/\/$/,
		''
	);
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;

	return `${testURL}${normalizedPath}`;
};

const logToCi = (message) => {
	cy.log(message);
	cy.task('logToCi', message, { log: false });
};

const logPluginCompatibilityVersions = () => {
	cy.request({
		url: resolveTestUrl(
			'/wp-content/plugins/blockera-pro/blockera-pro.php'
		),
		failOnStatusCode: false,
	}).then((proResponse) => {
		cy.request({
			url: resolveTestUrl('/wp-content/plugins/blockera/blockera.php'),
			failOnStatusCode: false,
		}).then((freeResponse) => {
			const proVersion =
				proResponse.body?.match(/Version:\s*(\d+\.\d+\.\d+)/)?.[1] ??
				'unknown';
			const freeVersion =
				freeResponse.body?.match(/Version:\s*(\d+\.\d+\.\d+)/)?.[1] ??
				'unknown';
			const freeRequiresPro =
				freeResponse.body?.match(
					/Requires at least blockera-pro:\s*(\d+\.\d+\.\d+)/
				)?.[1] ?? 'unknown';
			const proRequiresFree =
				proResponse.body?.match(
					/Requires at least blockera:\s*(\d+\.\d+\.\d+)/
				)?.[1] ?? 'unknown';

			logToCi(
				`[${SPEC_LABEL}] Blockera Pro ${proVersion} (requires free ${proRequiresFree}) | Blockera Free ${freeVersion} (requires pro ${freeRequiresPro})`
			);
		});
	});
};

describe('Blockera PRO plugin compatibility checks', () => {
	it('should be able to see plugin compatibility page while user try to navigate WordPress admin pages if not compatible with free version', () => {
		goTo('/wp-admin/admin.php?page=blockera-settings-dashboard');

		logPluginCompatibilityVersions();

		cy.location('href').then((href) => {
			if (href.includes('page=blockera-compat')) {
				logToCi(
					`[${SPEC_LABEL}] Incompatible environment detected: redirected to blockera-compat (${href})`
				);

				cy.contains('Update Required for Blockera').should(
					'be.visible'
				);

				goTo('/wp-admin/post-new.php');
				cy.contains('Update Required for Blockera').should(
					'be.visible'
				);

				goTo('/wp-admin/site-editor.php');
				cy.contains('Update Required for Blockera').should(
					'be.visible'
				);

				goTo('/wp-admin/');
				cy.contains('Update Required for Blockera').should(
					'be.visible'
				);
			} else {
				logToCi(
					`[${SPEC_LABEL}] Compatible environment: dashboard loaded (${href})`
				);

				// Compatible free/pro (typical local env) — dashboard should load.
				cy.url().should(
					'include',
					'/wp-admin/admin.php?page=blockera-settings-dashboard'
				);
			}
		});
	});
});
