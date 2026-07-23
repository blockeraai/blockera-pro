import {
	savePage,
	getWPDataObject,
	getSelectedBlock,
	redirectToFrontPage,
	createPost,
} from '@blockera/dev-cypress/js/helpers';

describe('Transforms Settings → Functionality', () => {
	beforeEach(() => {
		createPost();

		cy.getBlock('default').type('This is test paragraph', { delay: 0 });
		cy.getByAriaControls('styles-view').click();

		cy.getParentContainer(
			'2D & 3D Transforms',
			'blockera-repeater-control'
		).as('transform');
	});

	it('should update transform, when add value to self perspective', () => {
		cy.getByAriaLabel('Add New Transform').click();
		cy.getByAriaLabel('Transformation Settings').click();

		cy.getParentContainer('Self Perspective')
			// .first()
			.within(() => {
				cy.get('input[type="text"]').focus();
				cy.get('input[type="text"]').clear();
				cy.get('input[type="text"]').type(150);
			});

		//Check block
		cy.getIframeBody().within(() => {
			cy.get('#blockera-styles-wrapper')
				.invoke('text')
				.should(
					'include',
					'transform: perspective(150px) translate3d(0px, 0px, 0px)'
				);
		});

		//Check store
		getWPDataObject().then((data) => {
			expect('150px').to.be.equal(
				getSelectedBlock(data, 'blockeraTransformSelfPerspective')
			);
		});

		//Check frontEnd
		savePage();

		redirectToFrontPage();

		cy.get('style#blockera-inline-css')
			.invoke('text')
			.should(
				'include',
				'transform: perspective(150px) translate3d(0px, 0px, 0px) !important'
			);
	});

	it('should update transform-origin, when add value to self origin', () => {
		cy.getByAriaLabel('Add New Transform').click();
		cy.getByAriaLabel('Transformation Settings').click();

		cy.getByAriaLabel('Self Perspective Origin').click();

		cy.get('.components-popover')
			.last()
			.within(() => {
				cy.get('span[aria-label="center center item"]').click({
					force: true,
				});
			});

		cy.getIframeBody().within(() => {
			cy.get('#blockera-styles-wrapper')
				.invoke('text')
				.should('include', 'transform-origin: 50% 50%');
		});

		//Check store
		getWPDataObject().then((data) => {
			expect({ top: '50%', left: '50%' }).to.be.deep.equal(
				getSelectedBlock(data, 'blockeraTransformSelfOrigin')
			);
		});

		//Check frontEnd
		savePage();

		redirectToFrontPage();

		cy.get('style#blockera-inline-css')
			.invoke('text')
			.should('include', 'transform-origin: 50% 50% !important;');
	});

	it('should update backface-visibility, when add value to backface-visibility', () => {
		cy.getByAriaLabel('Add New Transform').click();
		cy.getByAriaLabel('Transformation Settings').click();

		cy.getParentContainer('Backface Visibility').within(() => {
			cy.get('[aria-label="Hidden"]').click();
		});

		//Check block
		cy.getIframeBody().within(() => {
			cy.get('#blockera-styles-wrapper')
				.invoke('text')
				.should('include', 'backface-visibility: hidden');
		});

		//Check store
		getWPDataObject().then((data) => {
			expect('hidden').to.be.equal(
				getSelectedBlock(data, 'blockeraBackfaceVisibility')
			);
		});

		//Check frontEnd
		savePage();

		redirectToFrontPage();

		cy.get('style#blockera-inline-css')
			.invoke('text')
			.should('include', 'backface-visibility: hidden !important;');
	});

	it('should update perspective, when add value to child perspective', () => {
		cy.get('[aria-label="Add New Transform"]').click();
		cy.get('[aria-label="Transformation Settings"]').click();

		cy.getParentContainer('Child Perspective', 'base-control').within(
			() => {
				cy.get('input[type="text"]').focus();
				cy.get('input[type="text"]').clear();
				cy.get('input[type="text"]').type(150);
			}
		);

		//Check block
		cy.getBlock('core/paragraph').should(
			'have.css',
			'perspective',
			'150px'
		);

		//Check store
		getWPDataObject().then((data) => {
			expect('150px').to.be.equal(
				getSelectedBlock(data, 'blockeraTransformChildPerspective')
			);
		});

		//Check frontEnd
		savePage();

		redirectToFrontPage();

		cy.get('.blockera-block').should('have.css', 'perspective', '150px');
	});

	it('should update perspective-origin, when add value to child origin', () => {
		cy.getByAriaLabel('Add New Transform').click();
		cy.getByAriaLabel('Transformation Settings').click();

		cy.getByAriaLabel('Child Perspective Origin').click();

		cy.get('.components-popover')
			.last()
			.within(() => {
				cy.get('span[aria-label="center center item"]').click({
					force: true,
				});
			});

		//Check block
		cy.getIframeBody().within(() => {
			cy.get('#blockera-styles-wrapper')
				.invoke('text')
				.should('include', 'perspective-origin: 50% 50%');
		});

		//Check store
		getWPDataObject().then((data) => {
			expect({ top: '50%', left: '50%' }).to.be.deep.equal(
				getSelectedBlock(data, 'blockeraTransformChildOrigin')
			);
		});

		//Check frontEnd
		savePage();

		redirectToFrontPage();

		cy.get('style#blockera-inline-css')
			.invoke('text')
			.should('include', 'perspective-origin: 50% 50% !important;');
	});
});
