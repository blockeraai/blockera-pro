import { goTo } from '@blockera/dev-cypress/js/helpers';

describe('Activate License', () => {
	it('should activate license', () => {
		goTo('/wp-admin/admin.php?page=blockera-settings-account');
		cy.getByDataTest('activate-license-button').click();

		cy.url().then((url) => {
			if (url.includes('/wp-login.php')) {
				cy.get('#user_login').type(Cypress.env('wpUsername'), {
					delay: 0,
				});
				cy.get('#user_pass').type(Cypress.env('wpPassword'), {
					delay: 0,
				});
				cy.get('#wp-submit').click();

				cy.getByDataTest('connect-button').click();
				cy.getByDataTest('create-page-button').should('be.visible');
				cy.getByDataTest('manage-licenses-button').should('be.visible');

				cy.getByDataTest('manage-licenses-button').click();

				cy.getByDataTest('account-info').should('be.visible');
			}
		});
	});
});
