/**
 * Blockera dependencies
 */
import {
	appendBlocks,
	getSelectedBlock,
	assertBlockData,
	setInnerBlock,
	createPost,
	activateMuPlugin,
	deactivateMuPlugin,
	waitForThemeBaseDefaultGradientPreset,
} from '@blockera/dev-cypress/js/helpers';

const DEFAULT_GRADIENTS_MU =
	'packages/editor/js/extensions/libs/background/test/fixtures/background-default-gradients-enabled.php';
const DEFAULT_GRADIENTS_MU_NAME =
	'blockera-test-background-default-gradients-enabled.php';

const DEFAULT_RADIAL_GRADIENT_LAYER = {
	isVisible: true,
	type: 'radial-gradient',
	'radial-gradient': 'radial-gradient(rgb(0,159,251) 0%,rgb(229,46,0) 100%)',
	'radial-gradient-position': {
		top: '50%',
		left: '50%',
	},
	'radial-gradient-size': 'farthest-corner',
	'radial-gradient-repeat': 'no-repeat',
	'radial-gradient-attachment': 'scroll',
	order: 0,
};

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

				describe('Variable', () => {
					before(() => {
						activateMuPlugin({
							pluginPath: DEFAULT_GRADIENTS_MU,
							pluginName: DEFAULT_GRADIENTS_MU_NAME,
						});
					});

					after(() => {
						deactivateMuPlugin({
							pluginPath: DEFAULT_GRADIENTS_MU,
							pluginName: DEFAULT_GRADIENTS_MU_NAME,
						});
					});

					it('Variable value linear gradient', () => {
						waitForThemeBaseDefaultGradientPreset(
							'vivid-cyan-blue-to-vivid-purple'
						);

						appendBlocks(
							`<!-- wp:group {"style":{"elements":{"heading":{"color":{"gradient":"var:preset|gradient|vivid-cyan-blue-to-vivid-purple"}}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:heading -->
<h2 class="wp-block-heading">Heading text</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>paragraph text</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->`
						);

						cy.getBlock('core/heading').first().click();
						cy.getByAriaLabel('Select Group').click();
						cy.addNewTransition();

						cy.getParentContainer('Image & Gradient').as(
							'container'
						);

						assertBlockData((data) => {
							expect(
								'var:preset|gradient|vivid-cyan-blue-to-vivid-purple'
							).to.be.equal(
								getSelectedBlock(data, 'style')?.elements
									?.heading?.color?.gradient
							);
						});

						assertBlockData((data) => {
							expect({
								blockeraBackground: {
									'linear-gradient-0': {
										type: 'linear-gradient',
										'linear-gradient': {
											settings: {
												name: 'Vivid cyan blue to vivid purple',
												id: 'vivid-cyan-blue-to-vivid-purple',
												value: 'linear-gradient(135deg,rgb(6,147,227) 0%,rgb(155,81,224) 100%)',
												reference: {
													type: 'preset',
												},
												type: 'linear-gradient',
												var: '--wp--preset--gradient--vivid-cyan-blue-to-vivid-purple',
											},
											name: 'Vivid cyan blue to vivid purple',
											isValueAddon: true,
											valueType: 'variable',
										},
										'linear-gradient-angel': '',
										'linear-gradient-repeat': 'no-repeat',
										'linear-gradient-attachment': 'scroll',
										isVisible: true,
										order: 1,
									},
								},
							}).to.be.deep.equal(
								getSelectedBlock(data, 'blockeraInnerBlocks')[
									'core/heading'
								]?.attributes
							);
						});

						setInnerBlock('core/heading');

						cy.get('@container').within(() => {
							cy.get('[data-id="linear-gradient-0"]').click();
						});

						cy.get(
							'.components-popover.blockera-control-background-popover'
						).within(() => {
							cy.clickValueAddonButton();
						});

						cy.selectValueAddonItem(
							'light-green-cyan-to-vivid-green-cyan'
						);

						assertBlockData((data) => {
							expect(
								'var:preset|gradient|light-green-cyan-to-vivid-green-cyan'
							).to.be.equal(
								getSelectedBlock(data, 'style')?.elements
									?.heading?.color?.gradient
							);
						});

						cy.get('@container').within(() => {
							cy.getByAriaLabel('Delete linear gradient 0').click(
								{
									force: true,
								}
							);
						});

						assertBlockData((data) => {
							expect(undefined).to.be.equal(
								getSelectedBlock(data, 'style')?.elements
									?.heading?.color?.gradient
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

				cy.getBlock('core/heading').first().click();
				cy.getByAriaLabel('Select Group').click();
				cy.addNewTransition();

				cy.getParentContainer('Image & Gradient').as('imageContainer');

				assertBlockData((data) => {
					expect('#ffcaca').to.be.equal(
						getSelectedBlock(data, 'style')?.elements?.heading
							?.color?.background
					);
				});

				assertBlockData((data) => {
					expect({
						blockeraBackgroundColor: '#ffcaca',
					}).to.be.deep.equal(
						getSelectedBlock(data, 'blockeraInnerBlocks')[
							'core/heading'
						]?.attributes
					);
				});

				setInnerBlock('core/heading');

				cy.get('@imageContainer').within(() => {
					cy.getByAriaLabel('Add New Background').click({
						force: true,
					});
				});

				cy.get('.components-popover')
					.last()
					.within(() => {
						cy.get('button[aria-label="Radial Gradient"]').click({
							force: true,
						});
					});

				assertBlockData((data) => {
					expect({
						blockeraBackgroundColor: '#ffcaca',
						blockeraBackground: {
							'radial-gradient-0': DEFAULT_RADIAL_GRADIENT_LAYER,
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

				cy.setColorControlValue('BG Color', '666666');

				assertBlockData((data) => {
					expect({
						blockeraBackgroundColor: '#666666',
						blockeraBackground: {
							'radial-gradient-0': DEFAULT_RADIAL_GRADIENT_LAYER,
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

				cy.clearColorControlValue('BG Color');

				assertBlockData((data) => {
					expect({
						blockeraBackground: {
							'radial-gradient-0': DEFAULT_RADIAL_GRADIENT_LAYER,
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
						DEFAULT_RADIAL_GRADIENT_LAYER['radial-gradient']
					).to.be.equal(
						getSelectedBlock(data, 'style')?.elements?.heading
							?.color?.gradient
					);
				});

				cy.get('@imageContainer').within(() => {
					cy.getByAriaLabel('Delete radial gradient 0').click({
						force: true,
					});
				});

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
