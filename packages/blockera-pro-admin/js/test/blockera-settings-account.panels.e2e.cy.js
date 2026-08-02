import { goTo } from '@blockera/dev-cypress/js/helpers';

const loginToBlockerAI = () => {
	cy.get('body').then(($body) => {
		if ($body.find('input#username').length > 0) {
			cy.get('input#username').type(Cypress.env('blockeraUserName'));
			cy.get('input#password').type(Cypress.env('blockeraPassword'));
			cy.get('button[type="submit"]').click();

			cy.get('div[role="alert"]').should('not.be.visible');
		}
	});
};

const tryToActivatingLicense = () => {
	cy.url({ timeout: 10000 }).then((url) => {
		if (url.includes('/wp-login.php')) {
			// eslint-disable-next-line
			cy.wait(1000);

			cy.get('#user_login', { timeout: 10000 })
				.should('be.visible')
				.type(Cypress.env('blockeraUserName'));
			cy.get('#user_pass')
				.should('be.visible')
				.type(Cypress.env('blockeraPassword'));
			cy.get('#wp-submit').should('be.visible').click();

			cy.get('input')
				.eq(0)
				.parent()
				.then(($parent) => {
					if (!$parent.hasClass('is-checked')) {
						cy.get('input').eq(0).click();
					}
				});

			cy.getByDataTest('activate-license-button')
				.should('be.visible')
				.click();
			cy.getByDataTest('create-page-button').should('be.visible');
			cy.getByDataTest('manage-licenses-button')
				.should('be.visible')
				.click();
			cy.getByDataTest('account-info').should('be.visible');

			// Goto BlockeraAi website license panel for blockerabot account.
			cy.visit('https://blockera.ai/my-account/licenses');

			loginToBlockerAI();

			cy.getByDataTest('website-url')
				.eq(0)
				.contains(Cypress.env('testURL').replace(/https?:\/\//, ''));
		}
	});
};

describe('Activate License', () => {
	it('should activate license', () => {
		goTo('/wp-admin/options-permalink.php');
		cy.get('label').contains('Post name').click();
		cy.get('input[type="submit"').click();

		goTo('/wp-admin/admin.php?page=blockera-settings-account');
		cy.getByDataTest('activate-license-button').click();

		tryToActivatingLicense();
	});

	it('should clear registered licenses and try again to login and activate license', () => {
		goTo('/wp-admin/admin.php?page=blockera-settings-account');

		cy.request(
			'POST',
			Cypress.env('testURL') + '/wp-json/blockera/v1/auth/clear-licenses',
			{
				email: 'blockeraai+githubbot@gmail.com',
			}
		).then((response) => {
			expect(response.status).to.eq(200);
			cy.reload();
			cy.getByDataTest('activate-license-button').click();
			tryToActivatingLicense();
		});
	});
});
