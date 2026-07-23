import {
	savePage,
	createPost,
	appendBlocks,
	deSelectBlock,
	addBlockToPost,
	setBoxSpacingSide,
	redirectToFrontPage,
} from '@blockera/dev-cypress/js/helpers';

describe('Button Block → Icon Functionality + Visual Test (Custom SVG)', () => {
	beforeEach(() => {
		createPost();
	});

	it('Button block icon functionality + visual test', () => {
		appendBlocks(`<!-- wp:group {"blockeraPropsId":"0d0c133a-f40f-4846-bfbb-66a99db8888f","blockeraCompatId":"73117745690","blockeraSpacing":{"value":{"padding":{"top":"50px","right":"50px","bottom":"100px","left":"50px"}}},"className":"blockera-block blockera-block\u002d\u002dugv338","style":{"spacing":{"padding":{"top":"50px","right":"50px","bottom":"100px","left":"50px"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group blockera-block blockera-block--ugv338" style="padding-top:50px;padding-right:50px;padding-bottom:100px;padding-left:50px"><!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button">button 1</a></div>
<!-- /wp:button -->

<!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button">button 2</a></div>
<!-- /wp:button -->

<!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button">button 3</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->`);

		/**
		 * 1. Simple custom svg icon
		 */
		cy.getBlock('core/button').first().click();
		cy.getByAriaControls('settings-view').click();

		cy.getByAriaLabel('Choose Icon…').click();

		cy.get('[data-wp-component="Popover"]')
			.last()
			.within(() => {
				cy.getByAriaLabel('add-card Icon').click();
			});

		cy.getByDataCy('upload-svg-btn').click({ force: true });

		cy.get('input[type="file"]').selectFile(
			'packages/dev-cypress/js/fixtures/icon-blockera.svg',
			{
				force: true,
			}
		);

		cy.get('.media-toolbar-primary > .button').click();

		/**
		 * 2. customized icon
		 */
		cy.getBlock('core/button').eq(1).click();
		cy.getByAriaControls('settings-view').click();

		// set icon
		cy.getByAriaLabel('Choose Icon…').click();
		cy.get('[data-wp-component="Popover"]')
			.last()
			.within(() => {
				cy.getByAriaLabel('add-submenu Icon').click();
			});

		// upload custom svg
		cy.getByDataCy('upload-svg-btn').click({ force: true });
		cy.get('input[type="file"]').selectFile(
			'packages/dev-cypress/js/fixtures/icon-blockera.svg',
			{
				force: true,
			}
		);
		cy.get('.media-toolbar-primary > .button').click();

		// set end icon
		cy.getByAriaLabel('End').click();

		// set gap
		cy.getParentContainer('Gap').within(() => {
			cy.get('input').type(30, { force: true });
		});

		// set size
		cy.getParentContainer('Size').within(() => {
			cy.get('input').type(30, { force: true });
		});

		cy.setColorControlValue('Color', '666666');

		cy.getByAriaLabel('Rotate').click({ force: true });
		cy.getByAriaLabel('Flip Horizontal').click({ force: true });
		cy.getByAriaLabel('Flip Vertical').click({ force: true });

		/**
		 * 3. Visual test in editor
		 */
		deSelectBlock();

		cy.getBlock('core/group').first().compareSnapshot({
			name: '1-editor',
			testThreshold: 0.02,
		});

		//Check frontend
		savePage();

		redirectToFrontPage();

		// disable wp navbar to avoid screenshot issue
		cy.get('#wpadminbar').invoke('css', 'position', 'relative');

		cy.get('.wp-block-group.blockera-block').first().compareSnapshot({
			name: '1-frontend',
			testThreshold: 0.02,
		});
	});
});
