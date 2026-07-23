import {
	savePage,
	getWPDataObject,
	getSelectedBlock,
	redirectToFrontPage,
	openMoreFeaturesControl,
	createPost,
} from '@blockera/dev-cypress/js/helpers';

describe('Text Wrap → Functionality', () => {
	beforeEach(() => {
		createPost();

		cy.getBlock('default').type('This is test paragraph', { delay: 0 });
		cy.getByAriaControls('styles-view').click();

		openMoreFeaturesControl('More typography settings');
	});

	it('should update text-wrap, when add data', () => {
		cy.getParentContainer('Text Wrap').within(() => {
			cy.get('select').select('Pretty Wrap');
		});

		// Check block
		cy.getBlock('core/paragraph').should('have.css', 'text-wrap', 'pretty');

		//Check store
		getWPDataObject().then((data) => {
			expect('pretty').to.be.equal(
				getSelectedBlock(data, 'blockeraTextWrap')
			);
		});

		//Check frontend
		savePage();

		redirectToFrontPage();

		cy.get('.blockera-block').should('have.css', 'text-wrap', 'pretty');
	});
});
