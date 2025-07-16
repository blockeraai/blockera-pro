/**
 * Blockera dependencies
 */
import {
	goTo,
	createPost,
	resetPanelSettings,
} from '@blockera/dev-cypress/js/helpers';

describe('Canvas Editor', () => {
	it('should re-render canvas editor correctly', () => {
		goTo('/wp-admin/admin.php?page=blockera-settings-general-settings');

		cy.getByDataTest('2xl-desktop').should('be.visible');
		cy.getByDataTest('2xl-desktop').within(() => {
			cy.get('input').click();
		});
		cy.getByDataTest('xl-desktop').should('be.visible');
		cy.getByDataTest('xl-desktop').within(() => {
			cy.get('input').click();
		});
		cy.getByDataTest('l-desktop').should('be.visible');
		cy.getByDataTest('l-desktop').within(() => {
			cy.get('input').click();
		});
		cy.getByDataTest('mobile-landscape').should('be.visible');
		cy.getByDataTest('mobile-landscape').within(() => {
			cy.get('input').click();
		});

		cy.getByDataTest('update-settings').as('update');
		cy.get('@update').then(() => {
			cy.get('@update').click();
			cy.wait(2000);
		});

		createPost();

		cy.getByAriaLabel('Breakpoints').should('be.visible');
		cy.getByAriaLabel('Breakpoints').within(() => {
			cy.getByAriaLabel('Widescreens and TVs').click();
		});

		cy.get('iframe[name="editor-canvas"]').should('be.visible');
		cy.get('iframe[name="editor-canvas"]').should(
			'have.css',
			'width',
			'1920px'
		);

		cy.getByAriaLabel('Breakpoints').should('be.visible');
		cy.getByAriaLabel('Breakpoints').within(() => {
			cy.getByAriaLabel('Extra Large Desktop').click();
		});

		cy.get('iframe[name="editor-canvas"]').should('be.visible');
		cy.get('iframe[name="editor-canvas"]').should(
			'have.css',
			'width',
			'1440px'
		);

		cy.getByAriaLabel('Breakpoints').should('be.visible');
		cy.getByAriaLabel('Breakpoints').within(() => {
			cy.getByAriaLabel('Large Desktop').click();
		});

		cy.get('iframe[name="editor-canvas"]').should('be.visible');
		cy.get('iframe[name="editor-canvas"]').should(
			'have.css',
			'width',
			'1280px'
		);

		cy.getByAriaLabel('Breakpoints').should('be.visible');
		cy.getByAriaLabel('Breakpoints').within(() => {
			cy.getByAriaLabel('Tablet').click();
		});

		cy.get('iframe[name="editor-canvas"]').should('be.visible');
		cy.get('iframe[name="editor-canvas"]').should(
			'have.css',
			'width',
			'991px'
		);

		cy.getByAriaLabel('Breakpoints').should('be.visible');
		cy.getByAriaLabel('Breakpoints').within(() => {
			cy.getByAriaLabel('Mobile Landscape').click();
		});

		cy.get('iframe[name="editor-canvas"]').should('be.visible');
		cy.get('iframe[name="editor-canvas"]').should(
			'have.css',
			'width',
			'767px'
		);

		cy.getByAriaLabel('Breakpoints').should('be.visible');
		cy.getByAriaLabel('Breakpoints').within(() => {
			cy.getByAriaLabel('Mobile Portrait').click();
		});

		cy.get('iframe[name="editor-canvas"]').should('be.visible');
		cy.get('iframe[name="editor-canvas"]').should(
			'have.css',
			'width',
			'478px'
		);

		goTo('/wp-admin/admin.php?page=blockera-settings-general-settings');

		resetPanelSettings(true);

		cy.reload();
	});
});
