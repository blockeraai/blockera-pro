/**
 * Blockera dependencies
 */
import {
	appendBlocks,
	getSelectedBlock,
	getWPDataObject,
	createPost,
	setInnerBlock,
} from '@blockera/dev-cypress/js/helpers';

describe('Blocksy → Search Block → WP Compatibility', () => {
	beforeEach(() => {
		createPost();
	});

	describe('Input Border Color', () => {
		describe('Data Compatibility', () => {
			it('Simple Value', () => {
				appendBlocks(
					`<!-- wp:blocksy/search {"customInputBorderColor":"#0066ff"} -->
<div>Blocksy: Search Block</div>
<!-- /wp:blocksy/search -->`
				);

				// Select target block
				cy.getBlock('blocksy/search').first().click();

				//
				// Test 1: WP data to Blockera
				//

				// WP data should come to Blockera
				getWPDataObject().then((data) => {
					expect('').to.be.equal(
						getSelectedBlock(data, 'inputBorderColor')
					);

					expect('#0066ff').to.be.equal(
						getSelectedBlock(data, 'customInputBorderColor')
					);

					expect('#0066ff').to.be.equal(
						getSelectedBlock(data, 'blockeraInnerBlocks')[
							'elements/input'
						]?.attributes?.blockeraBorder?.all?.color
					);
				});

				//
				// Test 2: Blockera value to WP data
				//
				setInnerBlock('elements/input');

				cy.getParentContainer('Border Line').within(() => {
					cy.getByDataTest('border-control-color').click();
				});

				// color
				cy.getByDataTest('popover-body')
					.last()
					.within(() => {
						cy.get('input[maxlength="9"]').clear({ force: true });
						cy.get('input[maxlength="9"]').type('9958e3 ');
					});

				//
				// Check
				//
				getWPDataObject().then((data) => {
					expect(undefined).to.be.equal(
						getSelectedBlock(data, 'inputBorderColor')
					);

					expect('#9958e3').to.be.equal(
						getSelectedBlock(data, 'customInputBorderColor')
					);

					expect('#9958e3').to.be.equal(
						getSelectedBlock(data, 'blockeraInnerBlocks')[
							'elements/input'
						]?.attributes?.blockeraBorder?.all?.color
					);
				});

				//
				// Test 3: Clear Blockera value and check WP data
				//

				cy.resetBlockeraAttribute(
					'Border And Shadow',
					'Border Line',
					'reset'
				);

				getWPDataObject().then((data) => {
					expect(undefined).to.be.equal(
						getSelectedBlock(data, 'inputBorderColor')
					);

					expect('').to.be.equal(
						getSelectedBlock(data, 'customInputBorderColor')
					);

					expect(undefined).to.be.equal(
						getSelectedBlock(data, 'blockeraInnerBlocks')[
							'elements/input'
						]?.attributes?.blockeraBorder?.all?.color
					);
				});
			});
		});
	});
});
