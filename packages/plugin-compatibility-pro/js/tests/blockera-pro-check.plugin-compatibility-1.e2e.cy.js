import { goTo } from '@blockera/dev-cypress/js/helpers/site-navigation';

const SPEC_LABEL = 'plugin-compatibility-1';

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
	it('should not be able to see plugin compatibility page while user try to navigate WordPress admin pages if not compatible with free version', () => {
		goTo('/wp-admin/admin.php?page=blockera-settings-dashboard');

		logPluginCompatibilityVersions();

		cy.url().then((url) => {
			const onCompatPage = url.includes('page=blockera-compat');

			logToCi(
				`[${SPEC_LABEL}] Compatibility navigation result: url=${url} | onCompatPage=${onCompatPage} | expected=compatible`
			);
		});

		cy.url().should(
			'not.include',
			'/wp-admin/admin.php?page=blockera-compat'
		);
	});
});
