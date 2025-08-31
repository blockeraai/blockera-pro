import { goTo } from '@blockera/dev-cypress/js/helpers/site-navigation';

describe('Blockera PRO plugin compatibility checks', () => {
	it('should not be able to see plugin compatibility page while user try to navigate WordPress admin pages if not compatible with free version', () => {
		goTo('/wp-admin/admin.php?page=blockera-settings-dashboard');

		cy.url().should(
			'not.include',
			'/wp-admin/admin.php?page=blockera-compat'
		);

		cy.contains('Update Required for Blockera').should('not.be.visible');
	});
});
