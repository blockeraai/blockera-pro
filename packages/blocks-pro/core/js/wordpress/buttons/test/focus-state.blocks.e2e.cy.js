/**
 * Blockera dependencies
 */
import {
	savePage,
	createPost,
	appendBlocks,
	setBlockState,
	setInnerBlock,
	redirectToFrontPage,
} from '@blockera/dev-cypress/js/helpers';

describe('Buttons Block', () => {
	beforeEach(() => {
		createPost();
	});

	it('Focus state', () => {
		appendBlocks(`<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="#1">button 1</a></div>
<!-- /wp:button -->

<!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="#2">button 2</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->`);

		cy.getBlock('core/button').first().click();

		cy.getByAriaLabel('Select Buttons').click();

		// Block supported is active
		cy.get('.blockera-extension-block-card').should('be.visible');

		cy.checkBlockCardItems(['normal', 'hover', 'core/button']);

		//
		// 1. Block Styles
		//

		//
		// 1.2. core/button:focus state
		//
		setInnerBlock('core/button');
		setBlockState('Focus');

		cy.setColorControlValue('BG Color', 'cccccc');

		setBlockState('Normal');

		cy.getBlock('core/button')
			.first()
			.within(() => {
				cy.get('.wp-element-button')
					.focus()
					.should(
						'have.css',
						'background-color',
						'rgb(204, 204, 204)'
					);
			});

		//
		// 2. Assert front end
		//
		savePage();
		redirectToFrontPage();

		cy.get('.blockera-block.wp-block-buttons')
			.first()
			.within(() => {
				cy.get('a.wp-element-button')
					.first()
					.focus()
					.should(
						'have.css',
						'background-color',
						'rgb(204, 204, 204)'
					);
			});
	});
});
