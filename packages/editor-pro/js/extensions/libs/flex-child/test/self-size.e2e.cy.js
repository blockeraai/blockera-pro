import {
	savePage,
	getWPDataObject,
	getSelectedBlock,
	redirectToFrontPage,
	appendBlocks,
	createPost,
} from '@blockera/dev-cypress/js/helpers';

describe('Flex Child → Self Size', () => {
	beforeEach(() => {
		createPost();
	});

	beforeEach(() => {
		const code = `<!-- wp:group {"blockeraPropsId":"1025111558103","blockeraCompatId":"62433527647","blockeraDisplay":{"value":"flex"},"className":"blockera-group","layout":{"type":"flex"}} -->
<div class="wp-block-group blockera-group"><!-- wp:paragraph {"blockeraPropsId":"102511163356","blockeraCompatId":"62433349891","className":"blockera-paragraph"} -->
<p class="blockera-paragraph">This is a test text.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->`;
		appendBlocks(code);

		cy.getBlock('core/paragraph').click();

		cy.getByDataTest('style-tab').click();
	});

	it('Sizing Buttons (Shrink & Grow)', () => {
		//
		// Shrink
		//
		cy.getParentContainer('Self Size', 'base-control').within(() => {
			cy.getByAriaLabel('Shrink').click();
		});

		//Check block
		cy.getBlock('core/paragraph').should('have.css', 'flex', '0 1 auto');

		//Check store
		getWPDataObject().then((data) => {
			expect('shrink').to.be.equal(
				getSelectedBlock(data, 'blockeraFlexChildSizing')
			);
		});

		//
		// Grow
		//
		cy.getParentContainer('Self Size', 'base-control').within(() => {
			cy.getByAriaLabel('Grow').click();
		});

		//Check block
		cy.getBlock('core/paragraph').should('have.css', 'flex', '1 1 0%');

		//Check store
		getWPDataObject().then((data) => {
			expect('grow').to.be.equal(
				getSelectedBlock(data, 'blockeraFlexChildSizing')
			);
		});

		//
		// No Grow or Shrink
		//
		cy.getParentContainer('Self Size', 'base-control').within(() => {
			cy.getByAriaLabel('No Grow or Shrink').click();
		});

		//Check block
		cy.getBlock('core/paragraph').should('have.css', 'flex', '0 0 auto');

		//Check store
		getWPDataObject().then((data) => {
			expect('no').to.be.equal(
				getSelectedBlock(data, 'blockeraFlexChildSizing')
			);
		});

		//Check frontend
		savePage();

		redirectToFrontPage();

		cy.get('.blockera-paragraph').should('have.css', 'flex', '0 0 auto');
	});

	it('should update correctly, when adding custom data', () => {
		cy.getParentContainer('Self Size', 'base-control').within(() => {
			cy.getByAriaLabel('Custom').click();
			cy.getByAriaLabel('Custom Grow').type(1, {
				force: true,
			});
			cy.getByAriaLabel('Custom Shrink').type(2, {
				force: true,
			});
			cy.getByAriaLabel('Select Unit').last().select('%');
			cy.getByAriaLabel('Flex Basis').type(10, {
				force: true,
			});
		});

		//Check block
		cy.getBlock('core/paragraph').should('have.css', 'flex', '1 2 10%');

		//Check store
		getWPDataObject().then((data) => {
			expect('custom').to.be.equal(
				getSelectedBlock(data, 'blockeraFlexChildSizing')
			);
			expect('1').to.be.equal(
				getSelectedBlock(data, 'blockeraFlexChildGrow')
			);
			expect('2').to.be.equal(
				getSelectedBlock(data, 'blockeraFlexChildShrink')
			);
			expect('10%').to.be.equal(
				getSelectedBlock(data, 'blockeraFlexChildBasis')
			);
		});

		//Check frontend
		savePage();

		redirectToFrontPage();

		cy.get('.blockera-paragraph').should('have.css', 'flex', '1 2 10%');
	});
});
