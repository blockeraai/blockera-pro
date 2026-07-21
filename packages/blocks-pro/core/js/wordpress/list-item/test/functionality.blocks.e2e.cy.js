/**
 * Blockera dependencies
 */
import {
	savePage,
	createPost,
	appendBlocks,
	setBlockState,
	setInnerBlock,
	setParentBlock,
	redirectToFrontPage,
} from '@blockera/dev-cypress/js/helpers';

describe('List Item Block → Marker state', () => {
	beforeEach(() => {
		createPost();
	});

	it('Marker state with style customization', () => {
		appendBlocks(`<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>item 1 <a href="#">link is here</a></li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>item 2 <a href="#">link is here</a></li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->`);

		// Select target block
		cy.getBlock('core/list-item').first().click();

		//
		// 1. Edit Block
		//

		//
		// 1.1. states/marker
		//
		setBlockState('Marker');

		cy.setColorControlValue('Text Color', '00ffdf');

		cy.wait(100);

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

				cy.get('li')
					.last()
					.within(($el) => {
						cy.window().then((win) => {
							const marker = win.getComputedStyle(
								$el[0],
								'::marker'
							);
							const markerColor =
								marker.getPropertyValue('color');
							expect(markerColor).to.not.equal(
								'rgb(0, 255, 223)'
							);

							const markerContent =
								marker.getPropertyValue('content');
							expect(markerContent).to.equal('normal');
						});
					});
			});

		//
		// 2. Assert inner blocks selectors in front end
		//
		savePage();
		redirectToFrontPage();

		cy.get('.wp-block-list')
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

				cy.get('li')
					.last()
					.within(($el) => {
						cy.window().then((win) => {
							const marker = win.getComputedStyle(
								$el[0],
								'::marker'
							);
							const markerColor =
								marker.getPropertyValue('color');
							expect(markerColor).to.not.equal(
								'rgb(0, 255, 223)'
							);

							const markerContent =
								marker.getPropertyValue('content');
							expect(markerContent).to.equal('normal');
						});
					});
			});
	});

	it('Marker state with content and without style customization', () => {
		appendBlocks(`<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>item 1 <a href="#">link is here</a></li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>item 2 <a href="#">link is here</a></li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->`);

		// Select target block
		cy.getBlock('core/list-item').first().click();

		//
		// 1. Edit Block
		//

		//
		// 1.1. states/marker
		//
		setBlockState('Marker');

		//
		// 1.1.1. Content
		//
		cy.getParentContainer('Content').within(() => {
			cy.get('input[type=text]').type('Marker');
		});

		cy.wait(100);

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

				cy.get('li')
					.last()
					.within(($el) => {
						cy.window().then((win) => {
							const marker = win.getComputedStyle(
								$el[0],
								'::marker'
							);

							const markerContent =
								marker.getPropertyValue('content');
							expect(markerContent).to.equal('normal');
						});
					});
			});

		//
		// 2. Assert inner blocks selectors in front end
		//
		savePage();
		redirectToFrontPage();

		cy.get('.wp-block-list')
			.first()
			.within(() => {
				// states/marker
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

				cy.get('li')
					.last()
					.within(($el) => {
						cy.window().then((win) => {
							const marker = win.getComputedStyle(
								$el[0],
								'::marker'
							);

							const markerContent =
								marker.getPropertyValue('content');
							expect(markerContent).to.equal('normal');
						});
					});
			});
	});
});
