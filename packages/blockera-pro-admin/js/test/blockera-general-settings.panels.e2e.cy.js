import {
	createPost,
	goTo,
} from '@blockera/dev-cypress/js/helpers/site-navigation';
import {
	appendBlocks,
	resetPanelSettings,
} from '@blockera/dev-cypress/js/helpers';

describe('Blockera general settings testing...', () => {
	beforeEach(() => {
		goTo('/wp-admin/admin.php?page=blockera-settings-dashboard').then(
			() => {
				if (Cypress.$('#skip_activation').length) {
					cy.get('#skip_activation').click();
				}

				goTo(
					'/wp-admin/admin.php?page=blockera-settings-general-settings'
				);
			}
		);
	});

	it('should restrict block visibility controls with selected user roles', () => {
		resetPanelSettings();

		cy.get('label')
			.contains('Enable Blockera blocks for selected user roles:')
			.click();
		cy.get('label').contains('editor').click();

		cy.getByDataTest('update-settings').as('update');
		cy.get('@update').then(() => {
			cy.get('@update').click();
			cy.wait(2000);

			cy.addNewUser('editor', 'editor', 'editor');
			cy.addNewUser('contributor', 'contributor', 'contributor');

			cy.logout();
			cy.login('editor', 'editor');

			createPost();

			appendBlocks(`<!-- wp:paragraph /-->`);

			cy.getBlock('core/paragraph').click();

			cy.getByAriaLabel('Add New Background').should('not.exist');

			cy.logout();
			cy.login('contributor', 'contributor');

			createPost();

			appendBlocks(`<!-- wp:paragraph /-->`);

			cy.getBlock('core/paragraph').click();

			cy.getByAriaLabel('Add New Background').click();
		});
	});

	it('should restrict block visibility controls with selected post types', () => {
		resetPanelSettings();

		cy.get('label')
			.contains('Enable Blockera blocks for selected user roles:')
			.click();
		cy.get('label').contains('post').click();

		cy.getByDataTest('update-settings').as('update');
		cy.get('@update').then(() => {
			cy.get('@update').click();
			cy.wait(2000);

			createPost();

			appendBlocks(`<!-- wp:paragraph /-->`);

			cy.getBlock('core/paragraph').click();

			cy.getByAriaLabel('Add New Background').click();
		});
	});
});
