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
	setBoxSpacingSide,
	redirectToFrontPage,
} from '@blockera/dev-cypress/js/helpers';

describe('Page List Block', () => {
	beforeEach(() => {
		createPost();
	});

	it('Marker - custom style - no content', () => {
		appendBlocks(`<!-- wp:page-list /-->\n `);

		// Select target block
		cy.getBlock('core/page-list').click();

		// Block supported is active
		cy.get('.blockera-extension-block-card').should('be.visible');

		cy.checkBlockCardItems([
			'normal',
			'hover',
			'marker',
			'elements/item',
			'elements/item-container',
			'elements/current-page',
		]);

		//
		// 1. Edit Block
		//

		//
		// 1.1. states/marker
		//
		setBlockState('Markers');

		cy.setColorControlValue('Text Color', 'ff0000');

		cy.wait(100);

		cy.getBlock('core/page-list')
			.first()
			.within(() => {
				cy.get('li')
					.first()
					.within(($el) => {
						cy.window().then((win) => {
							const marker = win.getComputedStyle(
								$el[0],
								'::marker'
							);
							const markerColor =
								marker.getPropertyValue('color');
							expect(markerColor).to.equal('rgb(255, 0, 0)');
						});
					});
			});

		//
		// 3. Assert inner blocks selectors in front end
		//
		savePage();
		redirectToFrontPage();

		cy.get('.blockera-block.wp-block-page-list').within(() => {
			cy.get('li')
				.first()
				.within(($el) => {
					cy.window().then((win) => {
						const marker = win.getComputedStyle($el[0], '::marker');
						const markerColor = marker.getPropertyValue('color');
						expect(markerColor).to.equal('rgb(255, 0, 0)');
					});
				});
		});
	});

	it('Marker - no style - custom content', () => {
		appendBlocks(`<!-- wp:page-list /-->\n `);

		// Select target block
		cy.getBlock('core/page-list').click();

		// Block supported is active
		cy.get('.blockera-extension-block-card').should('be.visible');

		cy.checkBlockCardItems([
			'normal',
			'hover',
			'marker',
			'elements/item',
			'elements/item-container',
			'elements/current-page',
		]);

		//
		// 1. Edit Block
		//

		//
		// 1.1. states/marker
		//
		setBlockState('Markers');

		cy.getParentContainer('Content').within(() => {
			cy.get('input[type=text]').type('Marker');
		});

		cy.wait(100);

		cy.getBlock('core/page-list')
			.first()
			.within(() => {
				cy.get('li')
					.first()
					.within(($el) => {
						cy.window().then((win) => {
							const marker = win.getComputedStyle(
								$el[0],
								'::marker'
							);

							const markerContent =
								marker.getPropertyValue('content');

							expect(markerContent).to.equal('"Marker"');
						});
					});
			});

		//
		// 3. Assert inner blocks selectors in front end
		//
		savePage();
		redirectToFrontPage();

		cy.get('.blockera-block.wp-block-page-list').within(() => {
			cy.get('li')
				.first()
				.within(($el) => {
					cy.window().then((win) => {
						const marker = win.getComputedStyle($el[0], '::marker');

						const markerContent =
							marker.getPropertyValue('content');

						expect(markerContent).to.equal('"Marker"');
					});
				});
		});
	});
});
