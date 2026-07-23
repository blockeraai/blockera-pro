/**
 * Blockera dependencies
 */
import {
	createPost,
	appendBlocks,
	getWPDataObject,
	getSelectedBlock,
	activateMuPlugin,
	deactivateMuPlugin,
} from '@blockera/dev-cypress/js/helpers';

const ALLOW_SVG_MU =
	'packages/controls-pro/js/icon-control/test/fixtures/allow-svg-uploads.php';
const ALLOW_SVG_MU_NAME = 'blockera-test-allow-svg-uploads.php';

describe('icon-control → custom SVG upload (Pro)', () => {
	before(() => {
		activateMuPlugin({
			pluginPath: ALLOW_SVG_MU,
			pluginName: ALLOW_SVG_MU_NAME,
		});
	});

	after(() => {
		deactivateMuPlugin({
			pluginPath: ALLOW_SVG_MU,
			pluginName: ALLOW_SVG_MU_NAME,
		});
	});

	beforeEach(() => {
		createPost();
		appendBlocks(`<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button">Test btn 1</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->`);

		cy.getBlock('core/button').click();

		cy.getByAriaControls('settings-view').click();
	});

	it('should be able to upload custom svg when there is selected icon', () => {
		cy.getByAriaLabel('Choose Icon…').first().click();
		cy.selectIconByName('add-card');

		cy.getByDataCy('upload-svg-btn').click({ force: true });

		cy.contains('button', /Browse WordPress Media Library/i).click({
			force: true,
		});

		// Match free media-image e2e: open Upload files, then selectFile.
		cy.get('.media-modal').should('be.visible');
		cy.get('.media-modal').within(() => {
			cy.contains('button', 'Upload files').click();

			cy.get('input[type="file"]').selectFile(
				'packages/dev-cypress/js/fixtures/home.svg',
				{
					force: true,
				}
			);

			cy.get('.media-toolbar-primary > .button')
				.should('not.be.disabled')
				.click();
		});

		cy.contains('button', /Use icon/i).click({ force: true });

		getWPDataObject().then((data) => {
			const uploadedFileName = getSelectedBlock(data, 'blockeraIcon')
				.uploadSVG.filename;
			expect(uploadedFileName).to.match(/home(-\d+)?.svg/);
		});
	});
});
