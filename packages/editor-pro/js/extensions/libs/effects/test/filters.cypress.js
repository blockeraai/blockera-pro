import {
	savePage,
	addBlockToPost,
	getWPDataObject,
	getSelectedBlock,
	redirectToFrontPage,
	createPost,
} from '@blockera/dev-cypress/js/helpers';

describe('Filters → Functionality', () => {
	beforeEach(() => {
		createPost();

		addBlockToPost('core/paragraph', true, 'blockera-paragraph');

		cy.getBlock('core/paragraph').type('this is test text.', { delay: 0 });

		cy.getByDataTest('style-tab').click();

		cy.getParentContainer('Filters').as('filters');
	});

	it('Multiple filters + promoter', () => {
		cy.get('@filters').within(() => {
			cy.getByAriaLabel('Add New Filter Effect').click();
		});

		cy.get('.components-popover').within(() => {
			cy.getParentContainer('Type').within(() => {
				cy.get('select').select('brightness');
			});

			cy.getByDataTest('filter-brightness-input').clear();
			cy.getByDataTest('filter-brightness-input').type(100);
		});

		cy.get('@filters').within(() => {
			cy.getByAriaLabel('Add New Filter Effect').click();
		});

		cy.getByDataTest('popover-body').within(() => {
			cy.getParentContainer('Type', 'base-control').within(() => {
				cy.get('select').select('invert');
			});

			cy.getByDataTest('filter-invert-input').clear();
			cy.getByDataTest('filter-invert-input').type(50);
		});

		//Check block
		cy.getBlock('core/paragraph')
			.parent()
			.within(() => {
				cy.get('style')
					.invoke('text')
					.should('include', 'filter: brightness(100%) invert(50%);');
			});

		//Check store
		getWPDataObject().then((data) => {
			expect({
				'brightness-0': {
					isVisible: true,
					type: 'brightness',
					brightness: '100%',
					order: 0,
				},
				'invert-0': {
					isVisible: true,
					type: 'invert',
					invert: '50%',
					order: 1,
				},
			}).to.be.deep.equal(getSelectedBlock(data, 'blockeraFilter'));
		});

		cy.get('@filters').within(() => {
			cy.getByAriaLabel('Add New Filter Effect').click();
		});

		// promotion popover should not appear
		cy.get('.blockera-component-promotion-popover').should('not.exist');

		//Check frontend
		savePage();

		redirectToFrontPage();

		cy.get('style#blockera-inline-css-inline-css')
			.invoke('text')
			.should('include', 'filter: brightness(100%) invert(50%);');
	});
});
