/**
 * External dependencies
 */
import 'cypress-real-events';

/**
 * Blockera dependencies
 */
import {
	savePage,
	createPost,
	appendBlocks,
	setDeviceType,
	addBlockState,
	reSelectBlock,
	setBlockState,
	setInnerBlock,
	checkBlockCard,
	getWPDataObject,
	getSelectedBlock,
	getBlockClientId,
	checkCurrentState,
	redirectToFrontPage,
} from '@blockera/dev-cypress/js/helpers';

describe('Block State E2E Test', () => {
	beforeEach(() => {
		cy.viewport(1440, 1025);

		createPost();
	});

	const initialSetting = () => {
		appendBlocks(
			'<!-- wp:paragraph -->\n' +
				'<p>Test</p>\n' +
				'<!-- /wp:paragraph -->'
		);
		cy.getBlock('core/paragraph').click();
	};

	// FIXME: remove skip flag to execute below tests for custom-class and parent-class states.
	describe.skip('Custom Class & Parent Class', () => {
		it('should set attribute correctly when : Normal -> Custom Class / Parent Class', () => {
			initialSetting();
			addBlockState('custom-class');

			/**
			 * Custom Class
			 */
			cy.getByDataTest('popover-body').within(() => {
				cy.get('input[type="text"]').type('.test');
			});
			cy.getByAriaLabel('Input Width').type(100, { force: true });

			// Reselect
			reSelectBlock();

			// Assert control value
			cy.getByAriaLabel('Input Width').should('have.value', '100');

			// Assert block css
			//TODO: recheck
			cy.getIframeBody()
				.find(`[data-type="core/paragraph"]`)
				.parent()
				.within(() => {
					cy.get('style').as('style-tag');
				});

			cy.getIframeBody()
				.find(`[data-type="core/paragraph"]`)
				.invoke('attr', 'id')
				.then((id) => {
					cy.get('@style-tag')
						.invoke('text')
						.should('include', `.test,#${id}{width: 100px`);
				});

			cy.getIframeBody()
				.find(`[data-type="core/paragraph"]`)
				.should('have.class', 'test');

			// Change state to normal
			setBlockState('Normal');

			// Assert block css
			cy.getIframeBody(8)
				.find(`[data-type="core/paragraph"]`)
				.should('have.css', 'width', '100px');

			// Assert store data
			getWPDataObject().then((data) => {
				expect({ blockeraWidth: '100px' }).to.be.deep.equal(
					getSelectedBlock(data, 'blockeraBlockStates')[
						'custom-class'
					].breakpoints.laptop.attributes
				);
				expect('.test').to.be.deep.equal(
					getSelectedBlock(data, 'blockeraBlockStates')[
						'custom-class'
					]['css-class']
				);
			});

			/**
			 * Parent Class
			 */
			addBlockState('parent-class');
			cy.getByDataTest('popover-body').within(() => {
				cy.get('input[type="text"]').type('.parent-class');
			});

			cy.getByAriaLabel('Input Width').type(300, { force: true });

			// Reselect
			reSelectBlock();

			// Assert control value
			cy.getByAriaLabel('Input Width').should('have.value', '300');
			checkCurrentState('parent-class');

			// Assert block css
			//TODO:recheck
			cy.getIframeBody()
				.find(`[data-type="core/paragraph"]`)
				.invoke('attr', 'id')
				.then((id) => {
					cy.get('@style-tag')
						.invoke('text')
						.should('include', `.parent-class #${id}{width: 300px`);
				});

			// Assert store data
			getWPDataObject().then((data) => {
				expect({
					laptop: { attributes: { blockeraWidth: '300px' } },
				}).to.be.deep.equal(
					getSelectedBlock(data, 'blockeraBlockStates')[
						'parent-class'
					].breakpoints
				);
				expect('.parent-class').to.be.deep.equal(
					getSelectedBlock(data, 'blockeraBlockStates')[
						'parent-class'
					]['css-class']
				);
			});

			// frontend
			savePage();

			redirectToFrontPage();

			// Assert in default viewport
			//TODO:
		});

		it('should set attribute correctly when : Normal -> Tablet -> Custom Class', () => {
			initialSetting();
			setDeviceType('Tablet');
			addBlockState('custom-class');

			//
			cy.getByDataTest('popover-body').within(() => {
				cy.get('input[type="text"]').type('.test');
			});
			cy.getByAriaLabel('Input Width').type(100, { force: true });

			// Reselect
			reSelectBlock();

			// Assert control value
			cy.getByAriaLabel('Input Width').should('have.value', '100');
			checkCurrentState('custom-class');

			// Assert block css
			cy.getIframeBody()
				.find(`[data-type="core/paragraph"]`)
				.parent()
				.within(() => {
					cy.get('style').as('style-tag');
				});
			cy.getIframeBody()
				.find(`[data-type="core/paragraph"]`)
				.invoke('attr', 'id')
				.then((id) => {
					cy.get('@style-tag')
						.invoke('text')
						.should(
							'include',
							`.test,.is-tablet-preview #${id}{width: 100px`
						);
				});

			cy.getIframeBody()
				.find(`[data-type="core/paragraph"]`)
				.should('have.class', 'test')
				.and('have.css', 'width', '100px');

			// Change device to laptop
			setDeviceType('Laptop');

			// Assert block css
			cy.getIframeBody()
				.find(`[data-type="core/paragraph"]`)
				.should('not.have.css', 'width', '100px');

			// Assert store data
			getWPDataObject().then((data) => {
				expect({ blockeraWidth: '100px' }).to.be.deep.equal(
					getSelectedBlock(data, 'blockeraBlockStates')[
						'custom-class'
					].breakpoints.tablet.attributes
				);
				expect('.test').to.be.deep.equal(
					getSelectedBlock(data, 'blockeraBlockStates')[
						'custom-class'
					]['css-class']
				);
			});

			// frontend:TODO
		});

		it('should set attribute correctly when : Normal -> Tablet -> Parent Class', () => {
			initialSetting();
			setDeviceType('Tablet');
			setBlockState('parent-class');

			//
			cy.getByDataTest('popover-body').within(() => {
				cy.get('input[type="text"]').type('.test');
			});
			cy.getByAriaLabel('Input Width').type(100, { force: true });

			// Reselect
			reSelectBlock();

			// Assert control value
			cy.getByAriaLabel('Input Width').should('have.value', '100');
			checkCurrentState('parent-class');

			// Assert block css
			//TODO:recheck
			cy.getIframeBody()
				.find(`[data-type="core/paragraph"]`)
				.parent()
				.within(() => {
					cy.get('style').as('style-tag');
				});

			cy.getIframeBody()
				.find(`[data-type="core/paragraph"]`)
				.invoke('attr', 'id')
				.then((id) => {
					cy.get('@style-tag')
						.invoke('text')
						.should(
							'include',
							`.test .is-tablet-preview #${id}{width: 100px`
						);
				});

			// Assert store data
			getWPDataObject().then((data) => {
				expect({ blockeraWidth: '100px' }).to.be.deep.equal(
					getSelectedBlock(data, 'blockeraBlockStates')[
						'parent-class'
					].breakpoints.tablet.attributes
				);
				expect('.test').to.be.deep.equal(
					getSelectedBlock(data, 'blockeraBlockStates')[
						'parent-class'
					]['css-class']
				);
			});

			// frontend: TODO
		});
	});
});
