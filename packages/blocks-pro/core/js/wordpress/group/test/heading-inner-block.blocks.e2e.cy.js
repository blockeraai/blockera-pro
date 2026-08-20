/**
 * Blockera dependencies
 */
import {
	appendBlocks,
	getSelectedBlock,
	assertBlockData,
	setInnerBlock,
	createPost,
} from '@blockera/dev-cypress/js/helpers';

describe('Group Block → Heading Inner Block → WP Data Compatibility', () => {
	beforeEach(() => {
		createPost();
	});

	describe('Background', () => {
		describe('Background Gradient', () => {
			describe('Linear Gradient Background', () => {
				it('Simple Value', () => {
					appendBlocks(
						`<!-- wp:group {"style":{"elements":{"heading":{"color":{"gradient":"linear-gradient(135deg,rgb(135,254,56) 1%,rgb(255,147,147) 97%)"}}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:heading -->
<h2 class="wp-block-heading">Heading text</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>paragraph text</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->`
					);

					// Select target block
					cy.getBlock('core/heading').first().click();

					// Switch to parent block
					cy.getByAriaLabel('Select Group').click();

					cy.getByAriaControls('styles-view').click();

					// Force shared extensions (incl. compatibility) to initialize
					cy.addNewTransition();

					// add alias to the feature container
					cy.getParentContainer('Image & Gradient').as('container');

					//
					// Test 1: WP data to Blockera
					//

					// WP data should come to Blockera
					assertBlockData((data) => {
						expect({
							blockeraBackground: {
								'linear-gradient-0': {
									isVisible: true,
									type: 'linear-gradient',
									'linear-gradient':
										'linear-gradient(135deg,rgb(135,254,56) 1%,rgb(255,147,147) 97%)',
									'linear-gradient-angel': '135',
									'linear-gradient-repeat': 'no-repeat',
									'linear-gradient-attachment': 'scroll',
									order: 1,
								},
							},
						}).to.be.deep.equal(
							getSelectedBlock(data, 'blockeraInnerBlocks')[
								'core/heading'
							]?.attributes
						);
					});

					//
					// Test 2: Blockera value to WP data
					//

					setInnerBlock('core/heading');

					// open color popover
					cy.get('@container').within(() => {
						cy.get('[data-id="linear-gradient-0"]').as(
							'repeaterBtn'
						);
						cy.get('@repeaterBtn').click();
					});

					cy.get('.components-popover')
						.last()
						.within(() => {
							cy.getParentContainer('Angle').within(() => {
								cy.get('input[type="number"]').as('angelInput');
								cy.get('@angelInput').clear();
								cy.get('@angelInput').type('45');
							});
						});

					// Blockera value should be moved to WP data
					assertBlockData((data) => {
						expect({
							blockeraBackground: {
								'linear-gradient-0': {
									isVisible: true,
									type: 'linear-gradient',
									'linear-gradient':
										'linear-gradient(135deg,rgb(135,254,56) 1%,rgb(255,147,147) 97%)',
									'linear-gradient-angel': 45,
									'linear-gradient-repeat': 'no-repeat',
									'linear-gradient-attachment': 'scroll',
									order: 1,
								},
							},
						}).to.be.deep.equal(
							getSelectedBlock(data, 'blockeraInnerBlocks')[
								'core/heading'
							]?.attributes
						);
					});

					assertBlockData((data) => {
						expect(
							'linear-gradient(45deg,rgb(135,254,56) 1%,rgb(255,147,147) 97%)'
						).to.be.equal(
							getSelectedBlock(data, 'style')?.elements?.heading
								?.color?.gradient
						);
					});

					//
					// Test 3: Clear Blockera value and check WP data
					//

					// clear bg color
					cy.get('@container').within(() => {
						cy.getByAriaLabel('Delete linear gradient 0').click({
							force: true,
						});
					});

					// WP data should be removed too
					assertBlockData((data) => {
						expect(undefined).to.be.equal(
							getSelectedBlock(data, 'style')?.elements?.heading
								?.color?.gradient
						);
					});

					assertBlockData((data) => {
						expect({}).to.be.deep.equal(
							getSelectedBlock(data, 'blockeraInnerBlocks')[
								'core/heading'
							]?.attributes
						);
					});
				});

				it('Variable', () => {
					appendBlocks(
						`<!-- wp:group {"style":{"elements":{"heading":{"color":{"gradient":"var:preset|gradient|gradient-4"}}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:heading -->
<h2 class="wp-block-heading">Heading text</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>paragraph text</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->`
					);

					// Select target block
					cy.getBlock('core/paragraph').click();

					// Switch to parent block
					cy.getByAriaLabel('Select Group').click();

					cy.getByAriaControls('styles-view').click();
					cy.addNewTransition();

					// add alias to the feature container
					cy.getParentContainer('Image & Gradient').as('container');

					//
					// Test 1: WP data to Blockera
					//

					// WP data should come to Blockera
					assertBlockData((data) => {
						expect({
							blockeraBackground: {
								'linear-gradient-0': {
									isVisible: true,
									type: 'linear-gradient',
									'linear-gradient': {
										settings: {
											name: 'Vertical soft sage to white',
											id: 'gradient-4',
											value: 'linear-gradient(to bottom, #B1C5A4 0%, #F9F9F9 100%)',
											reference: {
												type: 'theme',
												theme: 'Twenty Twenty-Four',
											},
											type: 'linear-gradient',
											var: '--wp--preset--gradient--gradient-4',
										},
										name: 'Vertical soft sage to white',
										isValueAddon: true,
										valueType: 'variable',
									},
									'linear-gradient-angel': '',
									'linear-gradient-repeat': 'no-repeat',
									'linear-gradient-attachment': 'scroll',
									order: 1,
								},
							},
						}).to.be.deep.equal(
							getSelectedBlock(data, 'blockeraInnerBlocks')[
								'core/heading'
							]?.attributes
						);
					});

					//
					// Test 2: Blockera value to WP data
					//

					setInnerBlock('core/heading');

					// open color popover
					cy.get('@container').within(() => {
						cy.get('[data-id="linear-gradient-0"]').as(
							'repeaterBtn'
						);
						cy.get('@repeaterBtn').click();
					});

					// Open variables popover
					cy.get(
						'.components-popover.blockera-control-background-popover'
					).within(() => {
						cy.clickValueAddonButton();
					});

					cy.wait(500);

					// change variable
					cy.get(
						'.components-popover.blockera-control-popover-variables'
					).within(() => {
						cy.selectValueAddonItem('gradient-2');
					});

					// Blockera value should be moved to WP data
					assertBlockData((data) => {
						expect('var:preset|gradient|gradient-2').to.be.equal(
							getSelectedBlock(data, 'style')?.elements?.heading
								?.color?.gradient
						);
					});

					assertBlockData((data) => {
						expect({
							blockeraBackground: {
								'linear-gradient-0': {
									isVisible: true,
									type: 'linear-gradient',
									'linear-gradient': {
										settings: {
											name: 'Vertical soft sandstone to white',
											id: 'gradient-2',
											value: 'linear-gradient(to bottom, #C2A990 0%, #F9F9F9 100%)',
											reference: {
												type: 'theme',
												theme: 'Twenty Twenty-Four',
											},
											type: 'linear-gradient',
											var: '--wp--preset--gradient--gradient-2',
										},
										name: 'Vertical soft sandstone to white',
										isValueAddon: true,
										valueType: 'variable',
									},
									'linear-gradient-angel': '',
									'linear-gradient-repeat': 'no-repeat',
									'linear-gradient-attachment': 'scroll',
									order: 1,
								},
							},
						}).to.be.deep.equal(
							getSelectedBlock(data, 'blockeraInnerBlocks')[
								'core/heading'
							]?.attributes
						);
					});

					//
					// Test 3: Clear Blockera value and check WP data
					//

					// clear bg color
					cy.get('@container').within(() => {
						cy.getByAriaLabel('Delete linear gradient 0').click({
							force: true,
						});
					});

					// WP data should be removed too
					assertBlockData((data) => {
						expect(undefined).to.be.equal(
							getSelectedBlock(data, 'style')?.elements?.heading
								?.color?.gradient
						);
					});

					assertBlockData((data) => {
						expect({}).to.be.deep.equal(
							getSelectedBlock(data, 'blockeraInnerBlocks')[
								'core/heading'
							]?.attributes
						);
					});
				});
			});

			describe('Radial Gradient Background', () => {
				it('Simple Value', () => {
					appendBlocks(
						`<!-- wp:group {"style":{"elements":{"heading":{"color":{"gradient":"radial-gradient(#B1C5A4 0%,#F9F9F9 100%)"}}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:heading -->
<h2 class="wp-block-heading">Heading text</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>paragraph text</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->`
					);

					// Select target block
					cy.getBlock('core/heading').first().click();

					// Switch to parent block
					cy.getByAriaLabel('Select Group').click();

					cy.getByAriaControls('styles-view').click();
					cy.addNewTransition();

					// add alias to the feature container
					cy.getParentContainer('Image & Gradient').as('container');

					//
					// Test 1: WP data to Blockera
					//

					// WP data should come to Blockera
					assertBlockData((data) => {
						expect({
							blockeraBackground: {
								'radial-gradient-0': {
									isVisible: true,
									type: 'radial-gradient',
									'radial-gradient':
										'radial-gradient(#B1C5A4 0%,#F9F9F9 100%)',
									'radial-gradient-position': {
										top: '50%',
										left: '50%',
									},
									'radial-gradient-size': 'farthest-corner',
									'radial-gradient-attachment': 'scroll',
									order: 1,
								},
							},
						}).to.be.deep.equal(
							getSelectedBlock(data, 'blockeraInnerBlocks')[
								'core/heading'
							]?.attributes
						);
					});

					//
					// Test 2: Blockera value to WP data
					//

					setInnerBlock('core/heading');

					// open color popover
					cy.get('@container').within(() => {
						cy.get('[data-id="radial-gradient-0"]').as(
							'repeaterBtn'
						);
						cy.get('@repeaterBtn').click();
					});

					cy.getByDataTest('position-button').click();
					cy.getByDataTest('popover-body')
						.eq(1)
						.within(() => {
							cy.getParentContainer('Position').within(() => {
								cy.get('input').each(($input) => {
									cy.wrap($input).clear();
									cy.wrap($input).type('20');
								});
							});
						});

					// Blockera value should be moved to WP data
					assertBlockData((data) => {
						expect({
							blockeraBackground: {
								'radial-gradient-0': {
									isVisible: true,
									type: 'radial-gradient',
									'radial-gradient':
										'radial-gradient(#B1C5A4 0%,#F9F9F9 100%)',
									'radial-gradient-position': {
										top: '20%',
										left: '20%',
									},
									'radial-gradient-size': 'farthest-corner',
									'radial-gradient-attachment': 'scroll',
									order: 1,
									'radial-gradient-repeat': 'no-repeat',
								},
							},
						}).to.be.deep.equal(
							getSelectedBlock(data, 'blockeraInnerBlocks')[
								'core/heading'
							]?.attributes
						);
					});

					assertBlockData((data) => {
						expect(
							'radial-gradient(#B1C5A4 0%,#F9F9F9 100%)'
						).to.be.equal(
							getSelectedBlock(data, 'style')?.elements?.heading
								?.color?.gradient
						);
					});

					//
					// Test 3: Clear Blockera value and check WP data
					//

					// clear bg color
					cy.get('@container').within(() => {
						cy.getByAriaLabel('Delete radial gradient 0').click({
							force: true,
						});
					});

					// WP data should be removed too
					assertBlockData((data) => {
						expect(undefined).to.be.equal(
							getSelectedBlock(data, 'style')?.elements?.heading
								?.color?.gradient
						);
					});

					assertBlockData((data) => {
						expect({}).to.be.deep.equal(
							getSelectedBlock(data, 'blockeraInnerBlocks')[
								'core/heading'
							]?.attributes
						);
					});
				});
			});
		});

		describe('BG Color & Gradient At Same Time', () => {
			it('Both BG color and gradient (BG color have more priority)', () => {
				appendBlocks(
					`<!-- wp:group {"style":{"elements":{"heading":{"color":{"background":"#ffcaca"}}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:heading -->
<h2 class="wp-block-heading">Heading text</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>paragraph text</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->`
				);

				// Select target block
				cy.getBlock('core/paragraph').click();

				// Switch to parent block
				cy.getByAriaLabel('Select Group').click();

				cy.getByAriaControls('styles-view').click();
				cy.addNewTransition();

				// add alias to the feature container
				cy.getParentContainer('Image & Gradient').as('imageContainer');
				cy.getParentContainer('BG Color').as('colorContainer');

				//
				// Test 1: WP data to Blockera
				//

				assertBlockData((data) => {
					expect({
						blockeraBackgroundColor: '#ffcaca',
					}).to.be.deep.equal(
						getSelectedBlock(data, 'blockeraInnerBlocks')[
							'core/heading'
						]?.attributes
					);
				});

				assertBlockData((data) => {
					expect('#ffcaca').to.be.equal(
						getSelectedBlock(data, 'style')?.elements?.heading
							?.color?.background
					);
				});

				//
				// Test 2: Blockera value to WP data
				//

				setInnerBlock('core/heading');

				// open color popover
				cy.get('@imageContainer').within(() => {
					cy.getByAriaLabel('Add New Background').click();
				});

				cy.get('.components-popover')
					.last()
					.within(() => {
						// switch to radial gradient type
						cy.get('button[aria-label="Radial Gradient"]').click();
					});

				// Blockera value should be moved to WP data
				assertBlockData((data) => {
					expect({
						blockeraBackgroundColor: '#ffcaca',
						blockeraBackground: {
							'radial-gradient-0': {
								isVisible: true,
								type: 'radial-gradient',
								'radial-gradient':
									'radial-gradient(rgb(0,159,251) 0%,rgb(229,46,0) 100%)',
								'radial-gradient-position': {
									top: '50%',
									left: '50%',
								},
								'radial-gradient-size': 'farthest-corner',
								'radial-gradient-repeat': 'no-repeat',
								'radial-gradient-attachment': 'scroll',
								order: 0,
							},
						},
					}).to.be.deep.equal(
						getSelectedBlock(data, 'blockeraInnerBlocks')[
							'core/heading'
						]?.attributes
					);
				});

				assertBlockData((data) => {
					expect('#ffcaca').to.be.equal(
						getSelectedBlock(data, 'style')?.elements?.heading
							?.color?.background
					);

					expect(undefined).to.be.equal(
						getSelectedBlock(data, 'style')?.elements?.heading
							?.color?.gradient
					);
				});

				//
				// Test 3: change bg color
				//

				cy.get('@colorContainer')
					.first()
					.within(() => {
						cy.get('button').click();
					});

				cy.get('.components-popover')
					.last()
					.within(() => {
						cy.get('input').as('hexColorInput');
						cy.get('@hexColorInput').clear();
						cy.get('@hexColorInput').type('666');
					});

				assertBlockData((data) => {
					expect({
						blockeraBackgroundColor: '#666666',
						blockeraBackground: {
							'radial-gradient-0': {
								isVisible: true,
								type: 'radial-gradient',
								'radial-gradient':
									'radial-gradient(rgb(0,159,251) 0%,rgb(229,46,0) 100%)',
								'radial-gradient-position': {
									top: '50%',
									left: '50%',
								},
								'radial-gradient-size': 'farthest-corner',
								'radial-gradient-repeat': 'no-repeat',
								'radial-gradient-attachment': 'scroll',
								order: 0,
							},
						},
					}).to.be.deep.equal(
						getSelectedBlock(data, 'blockeraInnerBlocks')[
							'core/heading'
						]?.attributes
					);
				});

				assertBlockData((data) => {
					expect('#666666').to.be.equal(
						getSelectedBlock(data, 'style')?.elements?.heading
							?.color?.background
					);

					expect(undefined).to.be.equal(
						getSelectedBlock(data, 'style')?.elements?.heading
							?.color?.gradient
					);
				});

				//
				// Test 4: remove bg color and then the BG gradient should be synced to wp gradient
				//

				cy.get('.components-popover')
					.last()
					.within(() => {
						cy.get(
							'button[aria-label="Reset Color (Clear)"]'
						).click();
					});

				assertBlockData((data) => {
					expect({
						blockeraBackground: {
							'radial-gradient-0': {
								isVisible: true,
								type: 'radial-gradient',
								'radial-gradient':
									'radial-gradient(rgb(0,159,251) 0%,rgb(229,46,0) 100%)',
								'radial-gradient-position': {
									top: '50%',
									left: '50%',
								},
								'radial-gradient-size': 'farthest-corner',
								'radial-gradient-repeat': 'no-repeat',
								'radial-gradient-attachment': 'scroll',
								order: 0,
							},
						},
					}).to.be.deep.equal(
						getSelectedBlock(data, 'blockeraInnerBlocks')[
							'core/heading'
						]?.attributes
					);
				});

				assertBlockData((data) => {
					expect(undefined).to.be.equal(
						getSelectedBlock(data, 'style')?.elements?.heading
							?.color?.background
					);

					expect(
						'radial-gradient(rgb(0,159,251) 0%,rgb(229,46,0) 100%)'
					).to.be.equal(
						getSelectedBlock(data, 'style')?.elements?.heading
							?.color?.gradient
					);
				});

				//
				// Test 5: Clear Blockera value and check WP data
				//

				// clear bg color
				cy.get('@imageContainer').within(() => {
					cy.getByAriaLabel('Delete radial gradient 0').click({
						force: true,
					});
				});

				// WP data should be removed too
				assertBlockData((data) => {
					expect({}).to.be.deep.equal(
						getSelectedBlock(data, 'blockeraInnerBlocks')[
							'core/heading'
						]?.attributes
					);

					expect(undefined).to.be.equal(
						getSelectedBlock(data, 'style')?.elements?.heading
							?.color?.background
					);

					expect(undefined).to.be.equal(
						getSelectedBlock(data, 'style')?.elements?.heading
							?.color?.gradient
					);
				});
			});
		});
	});
});
