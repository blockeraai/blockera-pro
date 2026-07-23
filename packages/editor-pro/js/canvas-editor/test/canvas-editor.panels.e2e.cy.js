/**
 * Blockera dependencies
 */
import {
	goTo,
	createPost,
	dismissOpenModals,
	resetPanelSettings,
} from '@blockera/dev-cypress/js/helpers';

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

describe('Canvas Editor', () => {
	it('should re-render canvas editor correctly', () => {
		goTo('/wp-admin/admin.php?page=blockera-settings-general-settings');

		dismissOpenModals();

		// Start from defaults so toggles are deterministic.
		resetPanelSettings(true);
		cy.reload();
		dismissOpenModals();

		enableBreakpointSetting('2xl-desktop');
		enableBreakpointSetting('xl-desktop');
		enableBreakpointSetting('l-desktop');
		enableBreakpointSetting('mobile-landscape');

		cy.getByDataTest('update-settings').as('update');
		cy.get('@update').then(() => {
			cy.get('@update').click();
			cy.wait(2000);
		});

		createPost();

		cy.get('.edit-post-visual-editor', { timeout: 30000 }).should('exist');
		cy.getByDataTest('blockera-canvas-editor', { timeout: 30000 }).should(
			'be.visible'
		);
		cy.getByAriaLabel('Breakpoints').eq(0).should('be.visible');

		const selectBreakpoint = (label) => {
			cy.getByAriaLabel('Breakpoints')
				.eq(0)
				.should('be.visible')
				.within(() => {
					cy.getByAriaLabel(label).should('exist').click({
						force: true,
					});
				});
		};

		const assertCanvasWidth = (width) => {
			// Prefer exist + css over be.visible: the post settings sidebar can
			// cover the fixed iframe without meaning the canvas width is wrong.
			cy.get('iframe[name="editor-canvas"]')
				.should('exist')
				.and('have.css', 'width', width);
		};

		selectBreakpoint('Widescreens and TVs');
		assertCanvasWidth('1920px');

		selectBreakpoint('Extra Large Desktop');
		assertCanvasWidth('1440px');

		selectBreakpoint('Large Desktop');
		assertCanvasWidth('1280px');

		selectBreakpoint('Tablet');
		assertCanvasWidth('991px');

		selectBreakpoint('Mobile Landscape');
		assertCanvasWidth('767px');

		selectBreakpoint('Mobile Portrait');
		assertCanvasWidth('478px');

		goTo('/wp-admin/admin.php?page=blockera-settings-general-settings');

		resetPanelSettings(true);

		cy.reload();
	});
});
