/**
 * Blockera dependencies
 */
import {
	savePage,
	createPost,
	appendBlocks,
	setBlockState,
	redirectToFrontPage,
} from '@blockera/dev-cypress/js/helpers';

describe('Details Block', () => {
	beforeEach(() => {
		createPost();
	});

	it('Open state', () => {
		appendBlocks(`<!-- wp:details -->
<details class="wp-block-details"><summary>test title</summary><!-- wp:paragraph {"placeholder":"Type / to add a hidden block"} -->
<p>Paragraph text...</p>
<!-- /wp:paragraph --></details>
<!-- /wp:details -->`);

		// Select target block
		cy.getBlock('core/details').click();

		//
		// 1. Edit Block
		//

		//
		// 1.1. Block Styles
		//
		cy.setColorControlValue('BG Color', 'ff0000');

		cy.getBlock('core/details')
			.first()
			.should('have.css', 'background-color', 'rgb(255, 0, 0)');

		//
		// 1.3. states/open
		//
		setBlockState('Open');

		//
		// 1.3.1. BG color
		//
		cy.setColorControlValue('BG Color', '00ffdf');

		cy.getBlock('core/details')
			.first()
			.should('have.css', 'background-color', 'rgb(0, 255, 223)');

		// close
		cy.getBlock('core/details')
			.first()
			.within(() => {
				cy.get('summary').first().click();
			});

		cy.getBlock('core/details')
			.first()
			.should('have.css', 'background-color', 'rgb(255, 0, 0)');

		//
		// 2. Assert selectors in front end
		//
		savePage();
		redirectToFrontPage();

		cy.get('.blockera-block.wp-block-details').should(
			'have.css',
			'background-color',
			'rgb(255, 0, 0)'
		);

		cy.get('.blockera-block.wp-block-details').within(() => {
			cy.get('summary').first().click();
		});

		cy.get('.blockera-block.wp-block-details').should(
			'have.css',
			'background-color',
			'rgb(0, 255, 223)'
		);
	});
});
