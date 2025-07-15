import {
	goTo,
	createPost,
	appendBlocks,
	getBlockClientId,
	getWPDataObject,
	setBlockState,
	setInnerBlock,
	savePage,
	redirectToFrontPage,
	setDeviceType,
} from '@blockera/dev-cypress/js/helpers';

describe('Style Engine Testing ...', () => {
	it('should generate css for Widescreens and Tvs breakpoints', () => {
		goTo('/wp-admin/admin.php?page=blockera-settings-general-settings');

		cy.getByDataTest('2xl-desktop').should('be.visible');
		cy.getByDataTest('2xl-desktop').within(() => {
			cy.get('input').click();
		});

		cy.getByDataTest('update-settings').as('update');
		cy.get('@update').then(() => {
			cy.get('@update').click();
			cy.wait(2000);
		});

		createPost();

		appendBlocks(
			`<!-- wp:paragraph -->
<p>Test <a href="#">Link</a></p>
<!-- /wp:paragraph -->`
		);

		// Select target block
		cy.getBlock('core/paragraph').click();

		cy.getByAriaLabel('Breakpoints').eq(0).should('be.visible');
		cy.getByAriaLabel('Breakpoints')
			.eq(0)
			.within(() => {
				cy.getByAriaLabel('Widescreens and TVs').should('exist');
			});

		// Widescreens and Tvs.
		setDeviceType('Widescreens and TVs');

		// ********************* Manipulating attributes of master block in hover state ************************ //

		// 1- Set width for master block.
		cy.setInputFieldValue('Width', 'Size', 100);

		// 2- Assert master block css.
		getWPDataObject().then((data) => {
			// Before occurred real hover event.
			// Because we expect block element should have css style to show activated hover state.
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)}`)
				.should('have.css', 'width', '100px');

			// Real hover
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)}`)
				.realHover();
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)}`)
				.should('have.css', 'width', '100px');
		});

		// ********************* Switch to normal state and check css ************************ //

		cy.get('h1').realClick();
		cy.getBlock('core/paragraph').click();

		// 4- Assert master block css.
		cy.getBlock('core/paragraph').should('have.css', 'width', '100px');

		// ********************* Manipulating root attributes of inner block inside parent hover state ************************ //

		// 5- Set master block state to hover.
		setBlockState('Hover');

		// 6- Go to customize link inner block panel.
		setInnerBlock('elements/link');

		// 7- Set width for link inner block.
		cy.setInputFieldValue('Width', 'Size', 50);

		// 8- Set display block for link inner block.
		cy.getParentContainer('Display', 'base-control').within(() => {
			cy.getByAriaLabel('Block').click();
		});

		// 9- Assert link inner block css.
		getWPDataObject().then((data) => {
			// Real hover
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)}`)
				.realHover();
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.should('have.css', 'width', '50px');
		});

		// ********************* Manipulating pseudo-state attributes of inner block inside parent hover state ************************ //

		// 10- Set hover state to link inner block.
		setBlockState('Hover');

		// 11- Set width for link inner block.
		cy.setInputFieldValue('Width', 'Size', 2);

		// 12- Set display block for link inner block.
		cy.getParentContainer('Display', 'base-control').within(() => {
			cy.getByAriaLabel('Block').click();
		});

		// 13- Assert link inner block css.
		getWPDataObject().then((data) => {
			// Real hover
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.realHover();
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.should('have.css', 'width', '2px');
		});

		savePage();
		redirectToFrontPage();

		// Set 2xl-desktop viewport
		cy.viewport(1920, 1080);

		cy.get('.blockera-block').should('have.css', 'width', '100px');

		cy.get('.blockera-block').realHover();
		cy.get('.blockera-block a').should('have.css', 'width', '50px');

		cy.get('.blockera-block a').realHover();
		cy.get('.blockera-block a').should('have.css', 'width', '2px');
	});

	it('should generate css for Custom breakpoints (Laptops and Small Desktops)', () => {
		goTo('/wp-admin/admin.php?page=blockera-settings-general-settings');

		cy.getByDataTest('add-new-breakpoint').should('be.visible');
		cy.getByDataTest('add-new-breakpoint').click();

		cy.getParentContainer('Name').within(() => {
			cy.get('input').type('Laptop');
		});

		cy.getParentContainer('Size').within(() => {
			cy.getParentContainer('Min Width').within(() => {
				cy.get('input').type('1280', { delay: 0 });
			});

			cy.getParentContainer('Max Width').within(() => {
				cy.get('input').type('1368', { delay: 0 });

				cy.get('input').blur();
			});
		});

		cy.getParentContainer('Status').within(() => {
			cy.get('input').click();
		});

		cy.getByDataTest('update-settings').as('update');
		cy.get('@update').then(() => {
			cy.get('@update').click();
			cy.wait(2000);
		});

		createPost();

		appendBlocks(
			`<!-- wp:paragraph -->
<p>Test <a href="#">Link</a></p>
<!-- /wp:paragraph -->`
		);

		// Select target block
		cy.getBlock('core/paragraph').click();

		cy.getByAriaLabel('Breakpoints').eq(0).should('be.visible');
		cy.getByAriaLabel('Breakpoints')
			.eq(0)
			.within(() => {
				cy.getByAriaLabel('Laptop').should('exist');
			});

		// Laptop.
		setDeviceType('Laptop');

		// ********************* Manipulating attributes of master block in hover state ************************ //

		// 1- Set width for master block.
		cy.setInputFieldValue('Width', 'Size', 100);

		// 2- Assert master block css.
		getWPDataObject().then((data) => {
			// Before occurred real hover event.
			// Because we expect block element should have css style to show activated hover state.
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)}`)
				.should('have.css', 'width', '100px');

			// Real hover
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)}`)
				.realHover();
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)}`)
				.should('have.css', 'width', '100px');
		});

		// ********************* Switch to normal state and check css ************************ //

		cy.get('h1').realClick();
		cy.getBlock('core/paragraph').click();

		// 4- Assert master block css.
		cy.getBlock('core/paragraph').should('have.css', 'width', '100px');

		// ********************* Manipulating root attributes of inner block inside parent hover state ************************ //

		// 5- Set master block state to hover.
		setBlockState('Hover');

		// 6- Go to customize link inner block panel.
		setInnerBlock('elements/link');

		// 7- Set width for link inner block.
		cy.setInputFieldValue('Width', 'Size', 50);

		// 8- Set display block for link inner block.
		cy.getParentContainer('Display', 'base-control').within(() => {
			cy.getByAriaLabel('Block').click();
		});

		// 9- Assert link inner block css.
		getWPDataObject().then((data) => {
			// Real hover
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)}`)
				.realHover();
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.should('have.css', 'width', '50px');
		});

		// ********************* Manipulating pseudo-state attributes of inner block inside parent hover state ************************ //

		// 10- Set hover state to link inner block.
		setBlockState('Hover');

		// 11- Set width for link inner block.
		cy.setInputFieldValue('Width', 'Size', 2);

		// 12- Set display block for link inner block.
		cy.getParentContainer('Display', 'base-control').within(() => {
			cy.getByAriaLabel('Block').click();
		});

		// 13- Assert link inner block css.
		getWPDataObject().then((data) => {
			// Real hover
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.realHover();
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.should('have.css', 'width', '2px');
		});

		savePage();
		redirectToFrontPage();

		// Set 2xl-desktop viewport
		cy.viewport(1280, 1368);

		cy.get('.blockera-block').should('have.css', 'width', '100px');

		cy.get('.blockera-block').realHover();
		cy.get('.blockera-block a').should('have.css', 'width', '50px');

		cy.get('.blockera-block a').realHover();
		cy.get('.blockera-block a').should('have.css', 'width', '2px');
	});
});
