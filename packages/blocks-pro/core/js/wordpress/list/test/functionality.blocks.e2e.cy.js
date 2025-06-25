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

describe('List Block → Functionality + Inner blocks', () => {
	beforeEach(() => {
		createPost();
	});

	it.skip('Marker state with style customization', () => {
		appendBlocks(`<!-- wp:list -->
<ul><!-- wp:list-item -->
<li>item 1 <a href="#">link is here</a></li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>item 2</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>item 3</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->`);

		// Select target block
		cy.getBlock('core/list').click();

		// Switch to parent block
		cy.getByAriaLabel('Select List').click();

		// Block supported is active
		cy.get('.blockera-extension-block-card').should('be.visible');

		//
		// 1. Edit Block
		//

		//
		// 1.1. elements/item : states/marker
		//
		setInnerBlock('elements/item');
		setBlockState('Marker');

		cy.setColorControlValue('Text Color', '00ffdf');

		cy.getBlock('core/list')
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
							expect(markerColor).to.equal('rgb(0, 255, 223)');

							const markerContent =
								marker.getPropertyValue('content');
							expect(markerContent).to.not.equal('""');
						});
					});
			});

		//
		// 2. Assert inner blocks selectors in front end
		//
		savePage();
		redirectToFrontPage();

		cy.get('.blockera-block.wp-block-list').within(() => {
			// states/marker
			cy.get('li')
				.first()
				.within(($el) => {
					cy.window().then((win) => {
						const marker = win.getComputedStyle($el[0], '::marker');
						const markerColor = marker.getPropertyValue('color');
						expect(markerColor).to.equal('rgb(0, 255, 223)');

						const markerContent =
							marker.getPropertyValue('content');
						expect(markerContent).to.not.equal('""');
					});
				});

			cy.get('li')
				.last()
				.within(($el) => {
					cy.window().then((win) => {
						const marker = win.getComputedStyle($el[0], '::marker');
						const markerColor = marker.getPropertyValue('color');
						expect(markerColor).to.equal('rgb(0, 255, 223)');

						const markerContent =
							marker.getPropertyValue('content');
						expect(markerContent).to.not.equal('""');
					});
				});
		});
	});

	it('Marker state with content and without style customization', () => {
		appendBlocks(`<!-- wp:list -->
<ul><!-- wp:list-item -->
<li>item 1 <a href="#">link is here</a></li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>item 2</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>item 3</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->`);

		// Select target block
		cy.getBlock('core/list').click();

		// Switch to parent block
		cy.getByAriaLabel('Select List').click();

		// Block supported is active
		cy.get('.blockera-extension-block-card').should('be.visible');

		//
		// 1. Edit Block
		//

		//
		// 1.1. elements/item : states/marker
		//
		setInnerBlock('elements/item');
		setBlockState('Marker');

		//
		// 1.1.1. Content
		//
		cy.getParentContainer('Content').within(() => {
			cy.get('input[type=text]').type('Marker');
		});

		cy.getBlock('core/list')
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
		// 2. Assert inner blocks selectors in front end
		//
		savePage();
		redirectToFrontPage();

		cy.get('.blockera-block.wp-block-list').within(() => {
			// states/marker
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
