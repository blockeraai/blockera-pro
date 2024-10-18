import {
	savePage,
	getWPDataObject,
	getSelectedBlock,
	redirectToFrontPage,
	appendBlocks,
	createPost,
} from '@blockera/dev-cypress/js/helpers';

describe('Flex Child → Order', () => {
	beforeEach(() => {
		createPost();

		const code = `<!-- wp:group {"className":"blockera-group","layout":{"type":"flex"},"blockeraDisplay":{"value":"flex"},"blockeraPropsId":"1025111558103"} -->
<div class="wp-block-group blockera-group"><!-- wp:paragraph {"className":"blockera-paragraph","blockeraPropsId":"102511163356"} -->
<p class="blockera-paragraph">This is a test text.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->`;
		appendBlocks(code);

		cy.getBlock('core/paragraph').click();
		cy.getByDataTest('style-tab').click();
	});

	it('first and last options', () => {
		//
		// First
		//
		cy.getParentContainer('Self Order', 'base-control').within(() => {
			cy.getByAriaLabel('First').click();
		});

		//Check block
		cy.getBlock('core/paragraph').should('have.css', 'order', '-1');

		//Check store
		getWPDataObject().then((data) => {
			expect('first').to.be.equal(
				getSelectedBlock(data, 'blockeraFlexChildOrder')
			);
		});

		//
		// Last
		//
		cy.getParentContainer('Self Order', 'base-control').within(() => {
			cy.getByAriaLabel('Last').click();
		});

		//Check block
		cy.getBlock('core/paragraph').should('have.css', 'order', '100');

		//Check store
		getWPDataObject().then((data) => {
			expect('last').to.be.equal(
				getSelectedBlock(data, 'blockeraFlexChildOrder')
			);
		});

		//Check frontend
		savePage();

		redirectToFrontPage();

		cy.get('.blockera-paragraph').should('have.css', 'order', '100');
	});

	it('should update correctly, when adding custom order', () => {
		cy.getParentContainer('Self Order', 'base-control').within(() => {
			cy.getByAriaLabel('Custom Order').click();
			cy.get('input').type(10, { force: true });
		});

		//Check block
		cy.getBlock('core/paragraph').should('have.css', 'order', '10');

		//Check store
		getWPDataObject().then((data) => {
			expect('10').to.be.equal(
				getSelectedBlock(data, 'blockeraFlexChildOrderCustom')
			);
		});

		//Check frontend
		savePage();

		redirectToFrontPage();

		cy.get('.blockera-paragraph').should('have.css', 'order', '10');
	});
});
