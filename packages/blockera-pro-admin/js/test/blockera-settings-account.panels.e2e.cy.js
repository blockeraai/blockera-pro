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

describe('Activate License', () => {
	it('should activate license', () => {
		goTo('/wp-admin/options-permalink.php');
		cy.get('label').contains('Post name').click();
		cy.get('input[type="submit"').click();

		goTo('/wp-admin/admin.php?page=blockera-settings-account');
		cy.getByDataTest('activate-license-button').click();

		cy.url().then((url) => {
			if (url.includes('/wp-login.php')) {
				cy.get('#user_login').type(Cypress.env('blockeraUserName'));
				cy.get('#user_pass').type(Cypress.env('blockeraPassword'));
				cy.get('#wp-submit').click();

				cy.get('input')
					.eq(0)
					.parent()
					.then(($parent) => {
						if (!$parent.hasClass('is-checked')) {
							cy.get('input').eq(0).click();
						}
					});

				cy.getByDataTest('connect-button').click();
				cy.getByDataTest('create-page-button').should('be.visible');
				cy.getByDataTest('manage-licenses-button').should('be.visible');

				cy.getByDataTest('manage-licenses-button').click();

				cy.getByDataTest('account-info').should('be.visible');

				// Goto BlockeraAi website license panel for blockerabot account.
				cy.visit('https://blockera.ai/my-account/licenses');

				loginToBlockerAI();

				cy.getByDataTest('website-url')
					.eq(0)
					.contains(
						Cypress.env('testURL').replace(/https?:\/\//, '')
					);
			}
		});
	});

	it('should clear registered licenses and try again to login and activate license', () => {
		goTo('/wp-admin/admin.php?page=blockera-settings-account');

		cy.request(
			'POST',
			Cypress.env('testURL') + '/wp-json/blockera/v1/auth/clear-licenses',
			{
				email: 'blockeraai+githubbot@gmail.com',
			}
		)
			.its('status')
			.should('eq', 200);

		cy.reload();

		cy.getByDataTest('activate-license-button').click();

		cy.url().then((url) => {
			if (url.includes('/wp-login.php')) {
				cy.get('#user_login').type(Cypress.env('blockeraUserName'));
				cy.get('#user_pass').type(Cypress.env('blockeraPassword'));
				cy.get('#wp-submit').click();

				cy.get('input')
					.eq(0)
					.parent()
					.then(($parent) => {
						if (!$parent.hasClass('is-checked')) {
							cy.get('input').eq(0).click();
						}
					});

				cy.getByDataTest('connect-button').click();
				cy.getByDataTest('create-page-button').should('be.visible');
				cy.getByDataTest('manage-licenses-button').should('be.visible');

				cy.getByDataTest('manage-licenses-button').click();

				cy.getByDataTest('account-info').should('be.visible');

				// Goto BlockeraAi website license panel for blockerabot account.
				cy.visit('https://blockera.ai/my-account/licenses');

				loginToBlockerAI();

				cy.getByDataTest('website-url')
					.eq(0)
					.contains(
						Cypress.env('testURL').replace(/https?:\/\//, '')
					);
			}
		});
	});
});
