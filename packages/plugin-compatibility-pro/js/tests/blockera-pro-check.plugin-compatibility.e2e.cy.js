import { goTo } from '@blockera/dev-cypress/js/helpers/site-navigation';

describe('Blockera PRO plugin compatibility checks', () => {
	it('should be able to see plugin compatibility page while user try to navigate WordPress admin pages if not compatible with free version', () => {
		goTo('/wp-admin/admin.php?page=blockera-settings-dashboard');

		cy.url().should('include', '/wp-admin/admin.php?page=blockera-compat');

		cy.contains('Update Required for Blockera').should('be.visible');

		goTo('/wp-admin/post-new.php');

		cy.contains('Update Required for Blockera').should('be.visible');

		goTo('/wp-admin/site-editor.php');

		cy.contains('Update Required for Blockera').should('be.visible');
	});
});
