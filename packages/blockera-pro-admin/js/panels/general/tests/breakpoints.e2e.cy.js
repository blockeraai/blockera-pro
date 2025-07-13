/**
 * Blockera dependencies
 */
import { createPost } from '@blockera/dev-cypress/js/helpers';

describe('Breakpoints Functionalities', () => {
	beforeEach(() => {
		createPost();
	});

	it('should render breakpoints settings', () => {
		cy.getByDataTest('blockera-breakpoints-settings-opener').should(
			'be.visible'
		);

		cy.getByDataTest('blockera-breakpoints-settings-opener').click();

		cy.getByDataTest('add-new-breakpoint').should('be.visible');
	});

	it('should can add new breakpoint', () => {
		cy.getByDataTest('blockera-breakpoints-settings-opener').click();

		cy.getByDataTest('add-new-breakpoint').should('be.visible');
		cy.getByDataTest('add-new-breakpoint').click();

		cy.get('.components-popover').eq(1).should('be.visible');
		cy.get('.components-popover')
			.eq(1)
			.within(() => {
				cy.getParentContainer('Name').within(() => {
					cy.get('input').type('Laptop');
				});

				cy.getParentContainer('Size').within(() => {
					cy.getParentContainer('Min').within(() => {
						cy.get('input').type('1024', { delay: 0 });
					});

					cy.getParentContainer('Max').within(() => {
						cy.get('input').type('1920', { delay: 0 });

						cy.get('input').blur();
					});
				});
			});

		cy.getByDataTest('blockera-breakpoints-settings-opener').click();

		cy.getByDataTest('custom-7').should('be.visible');
		cy.getByDataTest('custom-7').click();

		// cy.get('.components-popover').eq(1).should('be.visible');
		// cy.get('.components-popover')
		// 	.eq(1)
		// 	.within(() => {
		// 		cy.getParentContainer('Icon').within(() => {
		// 			cy.get('button').click();
		// 			cy.get('div[role="listbox"').should('be.visible');
		// 		});
		// 	});

		cy.getByDataTest('custom-7').should('be.visible');
		cy.getByDataTest('custom-7').realHover();

		cy.getByAriaLabel('Delete custom 7').should('be.visible');
		cy.getByAriaLabel('Delete custom 7').click();

		cy.getByDataTest('custom-7').should('not.exist');
	});

	it('should enable status of Widescreens and TVs', () => {
		cy.getByDataTest('blockera-breakpoints-settings-opener').click();

		cy.getByDataTest('2xl-desktop').should('be.visible');
		cy.getByDataTest('2xl-desktop').within(() => {
			cy.get('input').click();
		});

		cy.getByAriaLabel('Breakpoints').eq(0).should('be.visible');
		cy.getByAriaLabel('Breakpoints')
			.eq(0)
			.within(() => {
				cy.getByAriaLabel('Widescreens and TVs').should('exist');
			});

		cy.getByDataTest('2xl-desktop').should('be.visible');
		cy.getByDataTest('2xl-desktop').within(() => {
			cy.get('input').click();
		});

		cy.getByAriaLabel('Breakpoints').eq(0).should('be.visible');
		cy.getByAriaLabel('Breakpoints')
			.eq(0)
			.within(() => {
				cy.getByAriaLabel('Widescreens and TVs').should('not.exist');
			});
	});
});
