/**
 * Pro E2E (editor-pro): shade-ramp ColorControls open the color picker when
 * `canEditShadeColors` is unlocked — no free-tier UpgradePrompt.
 *
 * MU fixture lives under shared global-styles-ui (read-only); this spec stays in editor-pro.
 */
import {
	activateMuPlugin,
	deactivateMuPlugin,
	getCustomPresetEditPopover,
	openGlobalStylesColorPaletteScreen,
} from '@blockera/dev-cypress/js/helpers';
import { clearPresetVariablesViewModeStorage } from '@blockera/dev-cypress/js/helpers/preset-variables-view';

const MU =
	'packages/global-styles-ui/js/colors/test/fixtures/e2e-color-variations-no-taxonomy.php';
const MU_NAME = 'e2e-color-variations-no-taxonomy.php';
const BASE_PRESET_LABEL = 'E2E Var Shade Base';
const THEME_PRESET_GROUP_LABELS = ['Theme variables', 'Theme'];

function openThemeColorPresetEditPopoverFromPalette(headerLabel) {
	openGlobalStylesColorPaletteScreen();

	cy.getParentContainer(THEME_PRESET_GROUP_LABELS).within(() => {
		cy.contains('[data-cy="color-repeater-item-header"]', headerLabel, {
			timeout: 20000,
		}).click({ force: true });
	});

	getCustomPresetEditPopover().should('be.visible');
}

function clickShadeRampSwatchInCustomPresetEditPopover(index = 0) {
	getCustomPresetEditPopover().within(() => {
		cy.get(
			'.blockera-component-editor-variable-variations-fields-wrapper [data-cy="color-btn"]',
			{ timeout: 20000 }
		)
			.eq(index)
			.should('be.visible')
			.click({ force: true });
	});
}

describe('Editor Pro → Color shade edit unlocked', () => {
	beforeEach(() => {
		clearPresetVariablesViewModeStorage();
		activateMuPlugin({ pluginPath: MU, pluginName: MU_NAME });
	});

	afterEach(() => {
		deactivateMuPlugin({ pluginPath: MU, pluginName: MU_NAME });
	});

	it('opens the color picker when clicking a shade ramp swatch and accepts a color edit', () => {
		openThemeColorPresetEditPopoverFromPalette(BASE_PRESET_LABEL);

		getCustomPresetEditPopover().within(() => {
			cy.contains('label', 'Enable Color Shades', {
				timeout: 20000,
			}).should('be.visible');
			cy.get(
				'.blockera-component-editor-variable-variations-fields-wrapper [data-cy="color-btn"]',
				{ timeout: 20000 }
			).should('have.length.at.least', 2);
		});

		clickShadeRampSwatchInCustomPresetEditPopover(0);

		cy.get('[data-cy="color-picker-css-value"]', { timeout: 15000 }).should(
			'be.visible'
		);
		cy.getByDataTest('promote-color-shade-edit').should('not.exist');
		cy.get('.blockera-component-upgrade-prompt').should('not.exist');

		cy.get('[data-cy="color-picker-css-value"]')
			.click({ force: true })
			.type('{selectall}#112233 ', { delay: 0 });

		cy.realPress('Escape');

		cy.get('[data-cy="color-picker-css-value"]').should('not.exist');
		getCustomPresetEditPopover().should('be.visible');
	});
});
