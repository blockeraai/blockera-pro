import {
	savePage,
	addBlockToPost,
	getWPDataObject,
	getSelectedBlock,
	redirectToFrontPage,
	openMoreFeaturesControl,
	createPost,
} from '@blockera/dev-cypress/js/helpers';

describe('Text Stroke → Functionality', () => {
	beforeEach(() => {
		createPost();

		addBlockToPost('core/paragraph', true, 'blockera-paragraph');

		cy.getBlock('core/paragraph').type('This is test text.', {
			delay: 0,
		});

		cy.getByDataTest('style-tab').click();

		openMoreFeaturesControl('More typography settings');
	});

	it('should update text-stroke, when add data', () => {
		/* Color */
		cy.getParentContainer('Text Stroke').within(() => {
			cy.getByDataCy('color-btn').click();
		});

		cy.getByDataTest('popover-body').within(() => {
			cy.get('input[maxlength="9"]').clear();
			cy.get('input[maxlength="9"]').type('5a22a4', { delay: 0 });
		});

		//Check block
		cy.getBlock('core/paragraph').should(
			'have.css',
			'-webkit-text-stroke-color',
			'rgb(90, 34, 164)'
		);

		//Check store
		getWPDataObject().then((data) => {
			expect({
				color: '#5a22a4',
				width: '1px',
			}).to.be.deep.equal(getSelectedBlock(data, 'blockeraTextStroke'));
		});

		/* Width */
		cy.getParentContainer('Text Stroke').within(() => {
			cy.get('input[type="text"]').clear();
			cy.get('input[type="text"]').type(10, { force: true });
		});

		//Check block
		cy.getBlock('core/paragraph').and(
			'have.css',
			'-webkit-text-stroke-width',
			'10px'
		);

		//Check store
		getWPDataObject().then((data) => {
			expect({
				color: '#5a22a4',
				width: '10px',
			}).to.be.deep.equal(getSelectedBlock(data, 'blockeraTextStroke'));
		});

		//Check frontend
		savePage();

		redirectToFrontPage();

		cy.get('.blockera-block')
			.should('have.css', '-webkit-text-stroke-color', 'rgb(90, 34, 164)')
			.and('have.css', '-webkit-text-stroke-width', '10px');
	});
});
