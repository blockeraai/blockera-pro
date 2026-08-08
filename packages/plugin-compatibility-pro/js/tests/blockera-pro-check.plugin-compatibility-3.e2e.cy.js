const SPEC_LABEL = 'plugin-compatibility-3';

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

/**
 * Visit an admin path without editor helpers (compat page has no block editor).
 *
 * @param {string} path
 */
const visitAdmin = (path) => {
	cy.visit(resolveTestUrl(path));
};

/**
 * Assert Free plugin header state for this force-compat scenario.
 *
 * @param {boolean} expectHeader
 */
const assertFreeRequiresProHeader = (expectHeader) => {
	cy.request({
		url: resolveTestUrl('/wp-content/plugins/blockera/blockera.php'),
		failOnStatusCode: false,
	}).then((freeResponse) => {
		const hasHeader =
			/Requires at least blockera-pro:\s*\d+\.\d+\.\d+/.test(
				freeResponse.body || ''
			);

		logToCi(
			`[${SPEC_LABEL}] Free Requires at least blockera-pro header present=${hasHeader} | expected=${expectHeader}`
		);

		expect(hasHeader).to.equal(expectHeader);
	});
};

describe('Blockera PRO force compatibility when Free lacks Requires at least blockera-pro', () => {
	before(() => {
		cy.task('simulateLegacyBlockeraFree').then((result) => {
			logToCi(
				`[${SPEC_LABEL}] simulateLegacyBlockeraFree: ok=${result?.ok} message=${result?.message}`
			);
			expect(result?.ok, result?.message).to.equal(true);
		});
	});

	after(() => {
		cy.task('restoreLegacyBlockeraFree').then((result) => {
			logToCi(
				`[${SPEC_LABEL}] restoreLegacyBlockeraFree: ok=${result?.ok} message=${result?.message}`
			);
		});
	});

	it('should redirect admin navigation to blockera-compat when Free has no Requires at least blockera-pro header', () => {
		assertFreeRequiresProHeader(false);

		// Fresh request so Pro re-evaluates companions_missing / force path.
		visitAdmin('/wp-admin/admin.php?page=blockera-settings-dashboard');

		cy.url().should('include', '/wp-admin/admin.php?page=blockera-compat');

		visitAdmin('/wp-admin/post-new.php');
		cy.url().should('include', 'page=blockera-compat');

		visitAdmin('/wp-admin/');
		cy.url().should('include', 'page=blockera-compat');
	});
});
