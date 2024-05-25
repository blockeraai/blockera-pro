import {
	savePage,
	addBlockToPost,
	getWPDataObject,
	getSelectedBlock,
	redirectToFrontPage,
	createPost,
} from '@blockera/dev-cypress/js/helpers';

describe('Transforms → Functionality', () => {
	beforeEach(() => {
		createPost();

		addBlockToPost('core/paragraph', true, 'blockera-paragraph');

		cy.getBlock('core/paragraph').type('this is test text.', { delay: 0 });

		cy.getByDataTest('style-tab').click();

		cy.getParentContainer(
			'2D & 3D Transforms',
			'blockera-repeater-control'
		).as('transform');
	});

	context('Transform Feature', () => {
		it('Multiple transforms + promoter', () => {
			cy.get('@transform').within(() => {
				cy.getByAriaLabel('Add New Transform').click();
			});

			cy.get('.components-popover').within(() => {
				cy.get('[aria-label="Skew"]').click();
				cy.get('[aria-label="Skew-X"]').type(10);
				cy.get('[aria-label="Skew-Y"]').type(20);
			});

			cy.get('@transform').within(() => {
				cy.getByAriaLabel('Add New Transform').click();
			});

			cy.get('.components-popover').each(($div) => {
				cy.get($div).within(() => {
					cy.get('[aria-label="Move"]').click();
					cy.get('[aria-label="Move-X"]').clear();
					cy.get('[aria-label="Move-X"]').type(150);
					cy.get('[aria-label="Move-Y"]').clear();
					cy.get('[aria-label="Move-Y"]').type(200);
					cy.get('[aria-label="Move-Z"]').clear();
					cy.get('[aria-label="Move-Z"]').type(100);
				});
			});

			//Check block
			cy.getBlock('core/paragraph')
				.parent()
				.within(() => {
					cy.get('style')
						.invoke('text')
						.should(
							'include',
							'transform: skew(10deg, 20deg) translate3d(150px, 200px, 100px)'
						);
				});

			//Check store
			getWPDataObject().then((data) => {
				expect({
					'skew-0': {
						type: 'skew',
						'skew-x': '10deg',
						'skew-y': '20deg',
						isVisible: true,
						order: 0,
					},
					'move-0': {
						type: 'move',
						'move-x': '150px',
						'move-y': '200px',
						'move-z': '100px',
						isVisible: true,
						order: 1,
					},
				}).to.be.deep.equal(
					getSelectedBlock(data, 'blockeraTransform')
				);
			});

			cy.get('@transform').within(() => {
				cy.getByAriaLabel('Add New Transform').click();
			});

			// promotion popover should not appear
			cy.get('.blockera-component-promotion-popover').should('not.exist');

			//Check frontEnd
			savePage();

			redirectToFrontPage();

			cy.get('style#blockera-core-inline-css-inline-css')
				.invoke('text')
				.should(
					'include',
					'transform: skew(10deg, 20deg) translate3d(150px, 200px, 100px)'
				);
		});
	});
});
