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

		// Deactivate Blockera PRO plugin
		goTo('/wp-admin/plugins.php');

		cy.get('a#deactivate-blockera-site-builder-pro').click();

		goTo('/wp-admin/plugin-editor.php');

		cy.get('button').contains('I understand').should('be.visible');
		cy.get('button').contains('I understand').click();

		cy.get('select[name="plugin"]').should('be.visible');
		cy.get('select[name="plugin"]').select('blockera-pro/blockera-pro.php');

		cy.get('input[type="submit"]').should('be.visible');
		cy.get('input[value="Select"]').click();

		// Get current version and update it
		cy.get('textarea[name="newcontent"]')
			.invoke('val')
			.then((content) => {
				const versionMatch = content.match(
					/Version:\s*(\d+\.\d+\.\d+)/
				);
				const currentVersion = versionMatch[1];

				// Split version into parts
				const [major, minor, patch] = currentVersion
					.split('.')
					.map(Number);

				// Decrease patch version
				let newPatch = patch;
				let newMinor = minor;
				let newMajor = major;

				if (patch === 0) {
					if (minor === 0) {
						newMajor--;
						newMinor = 9;
						newPatch = 9;
					} else {
						newMinor--;
						newPatch = 9;
					}
				} else {
					newPatch--;
				}

				const newVersion = `${newMajor}.${newMinor}.${newPatch}`;
				const versionLog = `[plugin-compatibility-2] Blockera Pro version downgrade: ${currentVersion} -> ${newVersion}`;

				cy.log(versionLog);
				cy.task('logToCi', versionLog, { log: false });

				const newContent = content.replace(
					`Version: ${currentVersion}`,
					`Version: ${newVersion}`
				);

				// Update textarea content
				cy.get('textarea[name="newcontent"]').invoke('val', newContent);

				// Trigger change event to ensure WordPress detects the modification
				cy.get('textarea[name="newcontent"]').trigger('change', {
					force: true,
				});
			});

		cy.get('input[value="Update File"]').click();

		// Wait for update to complete before proceeding
		cy.contains('File edited successfully.').should('be.visible');

		goTo('/wp-admin/plugins.php');

		// Activate Blockera PRO plugin if not already activated
		cy.get('a#activate-blockera-site-builder-pro').click();

		cy.go('back');
		cy.go('back');
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
