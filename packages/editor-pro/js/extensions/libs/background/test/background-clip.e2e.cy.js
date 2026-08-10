import {
	savePage,
	getWPDataObject,
	getSelectedBlock,
	redirectToFrontPage,
	createPost,
} from '@blockera/dev-cypress/js/helpers';

describe('Background Clip → Functionality', () => {
	beforeEach(() => {
		createPost();

		cy.getBlock('default').type('This is test paragraph', { delay: 0 });
		cy.get('[aria-label="Settings"]').eq(1).click({ force: true });
		cy.getByAriaControls('styles-view').click();

		// add alias to the feature container
		cy.getParentContainer('Clipping').as('clippingContainer');
	});

	it('should set text clipping when block has text and background-mage', () => {
		cy.getParentContainer('Image & Gradient').as('image-and-gradient');

		cy.get('@image-and-gradient').within(() => {
			// add bg repeater item
			cy.getByAriaLabel('Add New Background').as('bgRepeaterAddBtn');
			cy.get('@bgRepeaterAddBtn').click();
		});

		// add background image
		cy.get('.components-popover')
			.last()
			.within(() => {
				cy.contains('button', /Upload Image/i).click();
			});

		cy.get('.media-modal').should('be.visible');
		cy.get('.media-modal').within(() => {
			cy.contains('button', 'Upload files').click();
			cy.get('input[type="file"]').selectFile(
				'packages/global-packages/packages/dev-cypress/js/fixtures/bg-extension-test.png',
				{
					force: true,
				}
			);
			cy.get('.media-toolbar-primary > .button')
				.should('not.be.disabled')
				.click();
		});

		// act : selecting clip to text
		cy.get('@clippingContainer').within(() => {
			cy.get('button').as('clippingBtn');
			cy.get('@clippingBtn').click();
			cy.contains('div[aria-selected="false"] span', /text/i).click();
		});

		//assert data
		getWPDataObject().then((data) => {
			const bgClipState = getSelectedBlock(
				data,
				'blockeraBackgroundClip'
			);
			expect(bgClipState).to.be.equal('text');
		});

		//assert block
		cy.getBlock('core/paragraph')
			.should('have.css', 'background-clip', 'text')
			.and('have.css', '-webkit-text-fill-color', 'rgba(0, 0, 0, 0)');

		//assert  frontend
		savePage();
		redirectToFrontPage();

		cy.get('.blockera-block').should('have.css', 'background-clip', 'text');
	});
});
