import {
	createPost,
	goTo,
} from '@blockera/dev-cypress/js/helpers/site-navigation';
import {
	appendBlocks,
	resetPanelSettings,
} from '@blockera/dev-cypress/js/helpers';

describe('Blockera Settings Account Panel Testing ...', () => {
	it('should redirect to the activate pro license page after activating the plugin', () => {
		goTo('/wp-admin/plugins.php').then(() => {
			cy.getByAriaLabel('Deactivate Blockera PRO').click();
			cy.getByAriaLabel('Activate Blockera PRO').click();

			cy.get('button').contains('Activate License').should('be.visible');
		});
	});

	it('should render the Activate Pro License menu at the dashboard while user not logged in', () => {
		goTo('/wp-admin/admin.php?page=blockera-settings-account').then(() => {
			if (Cypress.$('#skip_activation').length) {
				cy.get('#skip_activation').click();
			}

			cy.get('button').contains('Activate License').should('be.visible');

			cy.get('li.blockera-pro-submenu')
				.contains('Activate Pro License')
				.should('be.visible');
		});
	});

	it('should user can activate pro license while click on Activate License button', () => {
		goTo('/wp-admin/admin.php?page=blockera-settings-account').then(() => {
			if (Cypress.$('#skip_activation').length) {
				cy.get('#skip_activation').click();
			}

			cy.get('button').contains('Activate License').click();
		});
	});
});
