/**
 * Blockera dependencies
 */
import { goTo, createPost } from '@blockera/dev-cypress/js/helpers';

describe('Breakpoints Functionalities', () => {
	beforeEach(() => {
		goTo('/wp-admin/admin.php?page=blockera-settings-general-settings');

		cy.getByDataTest('update-settings').as('update');
	});

	it('should can add new breakpoint', () => {
		cy.getByDataTest('add-new-breakpoint').should('be.visible');
		cy.getByDataTest('add-new-breakpoint').click();

		cy.getParentContainer('Name').within(() => {
			cy.get('input').type('Laptop');
		});

		cy.getParentContainer('Size').within(() => {
			cy.getParentContainer('Min Width').within(() => {
				cy.get('input').type('1024', { delay: 0 });
			});

			cy.getParentContainer('Max Width').within(() => {
				cy.get('input').type('1920', { delay: 0 });

				cy.get('input').blur();
			});
		});

		cy.getByDataTest('custom-7').should('be.visible');
		cy.getByDataTest('custom-7').click();

		cy.getParentContainer('Icon').within(() => {
			cy.get('button').click();
			cy.get('button')
				.next()
				.within(() => {
					cy.contains('Custom').click();
				});
		});

		cy.getByDataTest('custom-7').should('be.visible');
		cy.getByDataTest('custom-7').within(() => {
			cy.get('div > div').realHover();
		});

		cy.getByAriaLabel('Delete custom 7').should('be.visible');
		cy.getByAriaLabel('Delete custom 7').click();

		cy.getByDataTest('custom-7').should('not.exist');
	});

	it.only('should enable status of Widescreens and TVs', () => {
		cy.getByDataTest('2xl-desktop').should('be.visible');
		cy.getByDataTest('2xl-desktop').within(() => {
			cy.get('input').click();
		});

		cy.get('@update').then(() => {
			cy.get('@update').click();
			cy.wait(2000);
		});
		createPost();

		cy.getByAriaLabel('Breakpoints').eq(0).should('be.visible');
		cy.getByAriaLabel('Breakpoints')
			.eq(0)
			.within(() => {
				cy.getByAriaLabel('Widescreens and TVs').should('exist');
			});

		goTo('/wp-admin/admin.php?page=blockera-settings-general-settings');

		cy.getByDataTest('2xl-desktop').should('be.visible');
		cy.getByDataTest('2xl-desktop').within(() => {
			cy.get('input').click();
		});

		cy.get('@update').then(() => {
			cy.get('@update').click();
			cy.wait(2000);
		});
		createPost();

		cy.getByAriaLabel('Breakpoints').eq(0).should('be.visible');
		cy.getByAriaLabel('Breakpoints')
			.eq(0)
			.within(() => {
				cy.getByAriaLabel('Widescreens and TVs').should('not.exist');
			});
	});
});
