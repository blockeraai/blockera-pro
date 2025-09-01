import {
	goTo,
	savePage,
	getWPDataObject,
	getSelectedBlock,
	createPost,
} from '@blockera/dev-cypress/js/helpers';

describe('Blockera PRO plugin compatibility checks', () => {
	it('should not conflicted with free plugin default functionality like style engine and render modules', () => {
		createPost();

		cy.getBlock('default').type('This is test paragraph', { delay: 0 });

		cy.get('[aria-label="Settings"]').eq(1).click({ force: true });

		cy.getByDataTest('style-tab').click();

		// add alias to the feature container
		cy.getParentContainer('BG Color').as('bgColorContainer');

		// act: clicking on color button
		cy.get('@bgColorContainer').within(() => {
			cy.get('button').as('colorBtn');
			cy.get('@colorBtn').click();
		});

		// act: entering new hexColor
		cy.get('.components-popover').each(() => {
			cy.get('.components-popover input').as('hexColorInput');
			cy.get('@hexColorInput').clear();
			cy.get('@hexColorInput').type('666');
		});

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

		// Abort any pending requests before navigation
		cy.window().then((win) => {
			win.stop();
		});

		let postLink = '';

		cy.get('.blockera-control-canvas-editor-preview-link a')
			.invoke('attr', 'href')
			.then((href) => {
				postLink = href;
			});

		// ============================= Edit Blockera PRO Main File ============================ //
		goTo('/wp-admin/plugin-editor.php');

		cy.get('button').contains('I understand').should('be.visible');
		cy.get('button').contains('I understand').click();

		cy.get('select[name="plugin"]').should('be.visible');
		cy.get('select[name="plugin"]').select('blockera-pro/blockera-pro.php');

		cy.get('input[type="submit"]').should('be.visible');
		cy.get('input[value="Select"]').click();

		cy.get('textarea[name="newcontent"]').should('be.visible');

		// Get current version from plugin header
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

				// Replace version in content
				const newContent = content.replace(
					`Version: ${currentVersion}`,
					`Version: ${newVersion}`
				);

				cy.get('textarea[name="newcontent"]').clear();
				cy.get('textarea[name="newcontent"]').type(newContent, {
					delay: 0,
				});
			});

		cy.get('input[value="Update File"]').click();
		// ============================= Edit Blockera PRO Main File ============================ //

		cy.visit(postLink);

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
