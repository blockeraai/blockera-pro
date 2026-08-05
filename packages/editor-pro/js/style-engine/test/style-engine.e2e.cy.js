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
	dismissOpenModals,
	resetPanelSettings,
} from '@blockera/dev-cypress/js/helpers';

const PARAGRAPH_WITH_LINK = `<!-- wp:paragraph -->
<p>Test <a href="#">Link</a></p>
<!-- /wp:paragraph -->`;

/**
 * Enable a settings-panel breakpoint checkbox only when it is currently off.
 * Re-clicking an already-enabled breakpoint would disable it and break later asserts.
 *
 * @param {string} dataTest Breakpoint data-test id (e.g. `2xl-desktop`).
 */
const enableBreakpointSetting = (dataTest) => {
	cy.getByDataTest(dataTest).should('be.visible');
	cy.getByDataTest(dataTest).within(() => {
		cy.get('input').then(($input) => {
			if (!$input.is(':checked')) {
				cy.wrap($input).click({ force: true });
			}
		});
	});
};

const openGeneralSettings = () => {
	goTo('/wp-admin/admin.php?page=blockera-settings-general-settings');
	dismissOpenModals();
};

const saveGeneralSettings = () => {
	cy.getByDataTest('update-settings').should('be.visible').click();
	cy.wait(2000);
};

const setupEditorWithParagraph = () => {
	createPost();

	appendBlocks(PARAGRAPH_WITH_LINK);

	// Select target block
	cy.getBlock('core/paragraph').click();
};

describe('Style Engine Testing ...', () => {
	beforeEach(() => {
		openGeneralSettings();
		resetPanelSettings(true);
		cy.reload();
		dismissOpenModals();
	});

	it('should generate css for Widescreens and Tvs breakpoints', () => {
		enableBreakpointSetting('2xl-desktop');
		saveGeneralSettings();

		setupEditorWithParagraph();

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
			const blockSelector = `#block-${getBlockClientId(data)}`;

			// Before occurred real hover event.
			// Because we expect block element should have css style to show activated hover state.
			cy.getIframeBody()
				.find(blockSelector)
				.should('have.css', 'width', '100px');

			// Real hover
			cy.getIframeBody().find(blockSelector).safeRealHover();
			cy.getIframeBody()
				.find(blockSelector)
				.should('have.css', 'width', '100px');
		});

		// ********************* Switch to normal state and check css ************************ //

		setBlockState('Normal');

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
			const blockSelector = `#block-${getBlockClientId(data)}`;

			// Real hover
			cy.getIframeBody().find(blockSelector).safeRealHover();
			cy.getIframeBody()
				.find(`${blockSelector} a`)
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
			const blockSelector = `#block-${getBlockClientId(data)} a`;

			// Real hover
			cy.getIframeBody().find(blockSelector).safeRealHover();
			cy.getIframeBody()
				.find(blockSelector)
				.should('have.css', 'width', '2px');
		});

		savePage();
		redirectToFrontPage();

		// Set 2xl-desktop viewport
		cy.viewport(1920, 1080);

		cy.get('.blockera-block').should('have.css', 'width', '100px');

		cy.get('.blockera-block').safeRealHover();
		cy.get('.blockera-block a').should('have.css', 'width', '50px');

		cy.get('.blockera-block a').safeRealHover();
		cy.get('.blockera-block a').should('have.css', 'width', '2px');
	});

	it('should generate css for Custom breakpoints (Laptops and Small Desktops)', () => {
		cy.getByDataTest('add-new-breakpoint').should('be.visible').click();

		cy.getParentContainer('Name').within(() => {
			cy.get('input').type('Laptop');
		});

		cy.getParentContainer('Size').within(() => {
			cy.getParentContainer('Min Width').within(() => {
				cy.get('input').type('1280', { delay: 0 });
			});

			cy.getParentContainer('Max Width').within(() => {
				cy.get('input').type('1368', { delay: 0 }).blur();
			});
		});

		cy.getParentContainer('Status').within(() => {
			cy.get('input').click();
		});

		saveGeneralSettings();

		setupEditorWithParagraph();

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
			const blockSelector = `#block-${getBlockClientId(data)}`;

			// Before occurred real hover event.
			// Because we expect block element should have css style to show activated hover state.
			cy.getIframeBody()
				.find(blockSelector)
				.should('have.css', 'width', '100px');

			// Real hover
			cy.getIframeBody().find(blockSelector).safeRealHover();
			cy.getIframeBody()
				.find(blockSelector)
				.should('have.css', 'width', '100px');
		});

		// ********************* Switch to normal state and check css ************************ //

		setBlockState('Normal');

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
			const blockSelector = `#block-${getBlockClientId(data)}`;

			// Real hover
			cy.getIframeBody().find(blockSelector).safeRealHover();
			cy.getIframeBody()
				.find(`${blockSelector} a`)
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
			const blockSelector = `#block-${getBlockClientId(data)} a`;

			// Real hover
			cy.getIframeBody().find(blockSelector).safeRealHover();
			cy.getIframeBody()
				.find(blockSelector)
				.should('have.css', 'width', '2px');
		});

		savePage();
		redirectToFrontPage();

		// Set 2xl-desktop viewport
		cy.viewport(1280, 1368);

		cy.get('.blockera-block').should('have.css', 'width', '100px');

		cy.get('.blockera-block').safeRealHover();
		cy.get('.blockera-block a').should('have.css', 'width', '50px');

		cy.get('.blockera-block a').safeRealHover();
		cy.get('.blockera-block a').should('have.css', 'width', '2px');
	});
});
