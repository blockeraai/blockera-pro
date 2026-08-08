import {
	goTo,
	savePage,
	getWPDataObject,
	getSelectedBlock,
	createPost,
	redirectToFrontPage,
} from '@blockera/dev-cypress/js/helpers';

describe('Blockera PRO plugin compatibility checks', () => {
	it('should not conflicted with free plugin default functionality like style engine and render modules', () => {
		createPost();

		cy.getBlock('default').type('This is test paragraph', { delay: 0 });

		cy.get('[aria-label="Settings"]').eq(1).click({ force: true });

		cy.getByAriaControls('styles-view').click();

		// add alias to the feature container
		cy.getParentContainer('BG Color').as('bgColorContainer');

		// Uses last Popover + data-cy hex field (avoids multi-match .components-popover input)
		cy.setColorControlValue('BG Color', '666666');

		//assert data
		getWPDataObject().then((data) => {
			expect(
				getSelectedBlock(data, 'blockeraBackgroundColor')
			).to.be.equal('#666666');
		});

		// assert editor
		cy.getBlock('core/paragraph').should(
			'have.css',
			'backgroundColor',
			'rgb(102, 102, 102)'
		);

		//assert frontend
		savePage();
		redirectToFrontPage();

		cy.get('.blockera-block').should(
			'have.css',
			'background-color',
			'rgb(102, 102, 102)'
		);

		// Deactivate Blockera PRO, downgrade its header Version on disk, then reactivate.
		// Do not use plugin-editor UI: CodeMirror owns the buffer and ignores textarea.invoke('val').
		goTo('/wp-admin/plugins.php');

		cy.get('a#deactivate-blockera-site-builder-pro').click();

		cy.task('downgradeBlockeraProVersion').then((result) => {
			const versionLog = `[plugin-compatibility-2] Blockera Pro version downgrade: ${result?.from ?? '?'} -> ${result?.to ?? '?'} | ok=${result?.ok} message=${result?.message}`;
			cy.log(versionLog);
			cy.task('logToCi', versionLog, { log: false });
			expect(result?.ok, result?.message).to.equal(true);
		});

		goTo('/wp-admin/plugins.php');

		// Activate Blockera PRO plugin if not already activated
		cy.get('a#activate-blockera-site-builder-pro').click();

		cy.go('back');
		cy.go('back');
		cy.go('back');
		cy.go('back');

		cy.reload();

		cy.get('.blockera-block').should(
			'have.css',
			'background-color',
			'rgb(102, 102, 102)'
		);
	});

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
});
