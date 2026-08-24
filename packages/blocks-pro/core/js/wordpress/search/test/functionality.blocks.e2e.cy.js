/**
 * Blockera dependencies
 */
import {
	savePage,
	createPost,
	appendBlocks,
	setInnerBlock,
	setBlockState,
	setParentBlock,
	redirectToFrontPage,
} from '@blockera/dev-cypress/js/helpers';

describe('Search Block', () => {
	beforeEach(() => {
		createPost();
	});

	it('Functionality + inner blocks', () => {
		appendBlocks(
			'<!-- wp:search {"label":"Search Title","buttonText":"Search","placeholder":"the placeholder"} /-->\n '
		);

		// Select target block
		cy.getBlock('core/search').click();

		// Block supported is active
		cy.get('.blockera-extension-block-card').should('be.visible');

		cy.checkBlockCardItems([
			'normal',
			'hover',
			'elements/label',
			'elements/input',
			'elements/button',
		]);

		//
		// 1. Edit Inner Blocks
		//

		//
		// 1.1. Block styles
		//
		cy.setColorControlValue('Text Color', 'ff1000');

		cy.getBlock('core/search')
			.first()
			.find('.wp-block-search__button')
			.should('have.css', 'color', 'rgb(255, 16, 0)');

		//
		// 1.2. elements/input:placeholder
		//
		setInnerBlock('elements/input');
		setBlockState('Placeholder');

		cy.checkBlockCardItems(
			['normal', 'hover', 'focus', 'placeholder'],
			true
		);

		//
		// 1.2.1. Placeholder
		//
		cy.setColorControlValue('Text Color', '1ca120');

		cy.wait(100);

		cy.getBlock('core/search')
			.first()
			.within(() => {
				cy.get('.wp-block-search__input')
					.first()
					.then(($el) => {
						const styles = window.getComputedStyle(
							$el[0],
							'::placeholder'
						);
						expect(styles.color).to.equal('rgb(28, 161, 32)');
					});
			});

		//
		// 2. Assert inner blocks selectors in front end
		//
		savePage();
		redirectToFrontPage();

		cy.get(
			'.blockera-block.wp-block-search .wp-block-search__button'
		).should('have.css', 'color', 'rgb(255, 16, 0)');

		cy.get('style#blockera-inline-css')
			.invoke('text')
			.should('include', `::placeholder`);
	});
});
