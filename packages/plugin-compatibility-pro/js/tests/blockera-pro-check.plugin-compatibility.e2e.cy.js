import {
	goTo,
	savePage,
	getWPDataObject,
	getSelectedBlock,
	redirectToFrontPage,
	createPost,
} from '@blockera/dev-cypress/js/helpers';

describe('Blockera PRO plugin compatibility checks', () => {
	it('should be able to see plugin compatibility page while user try to navigate WordPress admin pages if not compatible with free version', () => {
		goTo('/wp-admin/admin.php?page=blockera-settings-dashboard');

		cy.url().should('include', '/wp-admin/admin.php?page=blockera-compat');

		cy.contains('Update Required for Blockera').should('be.visible');

		goTo('/wp-admin/post-new.php');

		cy.contains('Update Required for Blockera').should('be.visible');

		goTo('/wp-admin/site-editor.php');

		cy.contains('Update Required for Blockera').should('be.visible');

		goTo('/wp-admin/');

		cy.contains('Update Required for Blockera').should('be.visible');
	});

	it('should not conflicted with free plugin default functionality like style engine and render modules', () => {
		createPost();

		cy.getBlock('default').type('This is test paragraph', { delay: 0 });
		cy.get('[aria-label="Settings"]').eq(1).click({ force: true });
		cy.getByDataTest('style-tab').click();

		// add alias to the feature container
		cy.getParentContainer('Clipping').as('clippingContainer');

		cy.get('@clippingContainer').within(() => {
			// act: clicking on clipping button
			cy.get('button').as('clippingBtn');
			cy.get('@clippingBtn').click();

			// select corresponding option
			cy.contains('div', 'Clip to Padding').click();
		});

		//assert data
		getWPDataObject().then((data) => {
			expect(
				getSelectedBlock(data, 'blockeraBackgroundClip')
			).to.be.equal('padding-box');
		});

		//assert block
		cy.getBlock('core/paragraph').should(
			'have.css',
			'background-clip',
			'padding-box'
		);

		//assert  frontend
		savePage();
		redirectToFrontPage();

		cy.get('.blockera-block').should(
			'have.css',
			'background-clip',
			'padding-box'
		);
	});
});
