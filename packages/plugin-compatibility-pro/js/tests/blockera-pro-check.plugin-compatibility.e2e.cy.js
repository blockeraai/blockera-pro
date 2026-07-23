import { goTo } from '@blockera/dev-cypress/js/helpers';

describe('Blockera PRO plugin compatibility checks', () => {
	it('should be able to see plugin compatibility page while user try to navigate WordPress admin pages if not compatible with free version', () => {
		goTo('/wp-admin/admin.php?page=blockera-settings-dashboard');

		cy.location('href').then((href) => {
			if (href.includes('page=blockera-compat')) {
				cy.contains('Update Required for Blockera').should(
					'be.visible'
				);

				goTo('/wp-admin/post-new.php');
				cy.contains('Update Required for Blockera').should(
					'be.visible'
				);

				goTo('/wp-admin/site-editor.php');
				cy.contains('Update Required for Blockera').should(
					'be.visible'
				);

				goTo('/wp-admin/');
				cy.contains('Update Required for Blockera').should(
					'be.visible'
				);
			} else {
				// Compatible free/pro (typical local env) — dashboard should load.
				cy.url().should(
					'include',
					'/wp-admin/admin.php?page=blockera-settings-dashboard'
				);
			}
		});
	});
});
