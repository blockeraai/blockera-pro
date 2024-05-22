import {
	createPost,
	goTo,
} from '@blockera/dev-cypress/js/helpers/site-navigation';
import {
	appendBlocks,
	resetAll
} from '@blockera/dev-cypress/js/helpers';

describe('Blockera general settings testing...', () => {
	beforeEach(() => {
		goTo('/wp-admin/admin.php?page=blockera-settings-general-settings');
	});

	it.only('should restrict block visibility controls with selected user roles', () => {
		resetAll();

		cy.get('label').contains('Restrict block visibility controls to selected user roles.').click();
		cy.get('label').contains('Editor').click();

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

			cy.getByAriaLabel('Add New Background').click();

			cy.logout();
			cy.login('contributor', 'contributor');

			createPost();

			appendBlocks(`<!-- wp:paragraph /-->`);

			cy.getBlock('core/paragraph').click();

			cy.getByAriaLabel('Add New Background').should('not.exist');
		});
	});
});