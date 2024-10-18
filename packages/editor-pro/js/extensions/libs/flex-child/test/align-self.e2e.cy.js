import {
	savePage,
	getWPDataObject,
	getSelectedBlock,
	redirectToFrontPage,
	appendBlocks,
	createPost,
} from '@blockera/dev-cypress/js/helpers';

describe('Flex Child → Align Self', () => {
	beforeEach(() => {
		createPost();
	});

	it('Functionality', () => {
		const code = `<!-- wp:group {"className":"blockera-group","layout":{"type":"flex"},"blockeraDisplay":{"value": "flex"},"blockeraPropsId":"1025111558103"} -->
<div class="wp-block-group blockera-group"><!-- wp:paragraph {"className":"blockera-paragraph","blockeraPropsId":"102511163356"} -->
<p class="blockera-paragraph">This is a test text.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->`;
		appendBlocks(code);

		cy.getBlock('core/paragraph').click();
		cy.getByDataTest('style-tab').click();

		//
		// Flex Start
		//
		cy.getParentContainer('Self Align', 'base-control').within(() => {
			cy.getByAriaLabel('Flex Start').click();
		});

		//Check block
		cy.getBlock('core/paragraph').should(
			'have.css',
			'align-self',
			'flex-start'
		);

		//Check store
		getWPDataObject().then((data) => {
			expect('flex-start').to.be.equal(
				getSelectedBlock(data, 'blockeraFlexChildAlign')
			);
		});

		//
		// Center
		//
		cy.getParentContainer('Self Align', 'base-control').within(() => {
			cy.getByAriaLabel('Center').click();
		});

		//Check block
		cy.getBlock('core/paragraph').should(
			'have.css',
			'align-self',
			'center'
		);

		//Check store
		getWPDataObject().then((data) => {
			expect('center').to.be.equal(
				getSelectedBlock(data, 'blockeraFlexChildAlign')
			);
		});

		//
		// Flex End
		//
		cy.getParentContainer('Self Align', 'base-control').within(() => {
			cy.getByAriaLabel('Flex End').click();
		});

		//Check block
		cy.getBlock('core/paragraph').should(
			'have.css',
			'align-self',
			'flex-end'
		);

		//Check store
		getWPDataObject().then((data) => {
			expect('flex-end').to.be.equal(
				getSelectedBlock(data, 'blockeraFlexChildAlign')
			);
		});

		//
		// Stretch
		//
		cy.getParentContainer('Self Align', 'base-control').within(() => {
			cy.getByAriaLabel('Stretch').click();
		});

		//Check block
		cy.getBlock('core/paragraph').should(
			'have.css',
			'align-self',
			'stretch'
		);

		//Check store
		getWPDataObject().then((data) => {
			expect('stretch').to.be.equal(
				getSelectedBlock(data, 'blockeraFlexChildAlign')
			);
		});

		//
		// Baseline
		//
		cy.getParentContainer('Self Align', 'base-control').within(() => {
			cy.getByAriaLabel('Baseline').click();
		});

		//Check block
		cy.getBlock('core/paragraph').should(
			'have.css',
			'align-self',
			'baseline'
		);

		//Check store
		getWPDataObject().then((data) => {
			expect('baseline').to.be.equal(
				getSelectedBlock(data, 'blockeraFlexChildAlign')
			);
		});

		//Check frontend
		savePage();

		redirectToFrontPage();

		cy.get('.blockera-paragraph').should(
			'have.css',
			'align-self',
			'baseline'
		);
	});
});
