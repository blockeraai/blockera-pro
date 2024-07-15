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
	describe('current-state testing ...', () => {
		it('should add correct state, after delete one of existed states', () => {
			initialSetting();

			// add hover, active, focus, visited, before, and after states.
			cy.multiClick('[aria-label="Add New State"]', 5);

			// remove active.
			cy.getByAriaLabel('Delete active').click({ force: true });

			// adding new state ...
			cy.getByAriaLabel('Add New State').click();

			// in this step must be existed "Active" state.
			checkCurrentState('active');

			// adding new state ...
			cy.getByAriaLabel('Add New State').click();

			// in this step must be existed "After" state.
			checkCurrentState('after');
		});

		it('should create correct id for block-state item when updated some states', () => {
			initialSetting();

			// add hover state.
			addBlockState('hover');

			// Checking store ...
			getWPDataObject().then((data) => {
				expect({}).to.be.deep.equal(
					getSelectedBlock(data, 'blockeraBlockStates')
				);
			});

			// Change current state to "Focus".
			cy.getByDataTest('popover-body').within(() => {
				cy.get('select').select('focus');
			});

			// Check store
			getWPDataObject().then((data) => {
				expect({}).to.be.deep.equal(
					getSelectedBlock(data, 'blockeraBlockStates')
				);
			});
		});
	});

	describe('block states visibility testing ...', () => {
		it('should not generate style for disable states', () => {
			initialSetting();

			// add hover state.
			addBlockState('hover');

			// Set width.
			cy.setInputFieldValue('Width', 'Size', 50);

			// Assert block css.
			getWPDataObject().then((data) => {
				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)}`)
					.should('have.css', 'width', '50px');

				// Real hover.
				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)}`)
					.realHover();
				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)}:hover`)
					.should('have.css', 'width', '50px');
			});

			// Disable state
			cy.contains('Hover')
				.parent()
				.parent()
				.parent()
				.parent()
				.within(() => {
					cy.get('[aria-label="Open Settings"]').click({
						force: true,
					});
				});
			cy.getByDataTest('popover-header').within(() =>
				cy.getByAriaLabel('Disable State').click({ force: true })
			);

			// Assert block css
			getWPDataObject().then((data) => {
				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)}`)
					.should('not.have.css', 'width', '50px');

				// Real hover
				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)}`)
					.realHover();
				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)}:hover`)
					.should('not.have.css', 'width', '50px');
			});
		});
	});

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

	describe('multiple states testing ...', () => {
		beforeEach(() => {
			initialSetting();
		});

		it('can manipulate settings', () => {
			cy.getByDataTest('border-control-width').type(5);

			reSelectBlock();

			// Assert control value
			cy.getByDataTest('border-control-width').should('have.value', '5');

			context(
				'can manipulate settings on hover state with inherit other settings of normal state',
				() => {
					addBlockState('hover');

					cy.getByDataTest('border-control-color').click();
					cy.getByDataTest('popover-body')
						.last()
						.within(() => {
							cy.get('input[maxlength="9"]').clear();
							cy.get('input[maxlength="9"]').type('ccc');
						});

					// inherit of normal.
					cy.getByDataTest('border-control-width').should(
						'have.value',
						'5'
					);

					reSelectBlock();

					// inherit of normal.
					cy.getByDataTest('border-control-width').should(
						'have.value',
						'5'
					);

					// hover settings data.
					cy.getByDataTest('border-control-color').should(
						'have.class',
						'is-not-empty'
					);

					checkCurrentState('hover');
				}
			);

			context(
				'can manipulate settings on focus state with inherit other settings of normal state',
				() => {
					addBlockState('focus');

					// Set border color.
					cy.getByDataTest('border-control-component').within(() => {
						cy.getByDataTest('border-control-color').next().click();

						// dotted border style.
						cy.get('ul').within(() =>
							cy.get('li').eq(2).click({ force: true })
						);
					});

					reSelectBlock();

					cy.getByDataTest('border-control-component').within(() => {
						cy.getByDataTest('border-control-color').next().click();

						// dotted border style.
						cy.get('ul').within(() =>
							cy
								.get('li')
								.eq(2)
								.should('have.attr', 'aria-selected', 'true')
						);
					});

					checkCurrentState('focus');
				}
			);

			context(
				'can inherit data of normal on focus on desktop breakpoint',
				() => {
					cy.getByDataTest('border-control-width').should(
						'have.value',
						'5'
					);
					cy.getByDataTest('border-control-color').should(
						'have.class',
						'is-empty'
					);

					reSelectBlock();

					cy.getByDataTest('border-control-width').should(
						'have.value',
						'5'
					);
					cy.getByDataTest('border-control-color').should(
						'have.class',
						'is-empty'
					);
				}
			);

			context(
				'can inherit data of normal on focus on mobile breakpoint',
				() => {
					setDeviceType('Mobile');

					cy.getByAriaLabel('Custom Box Border').click();

					// top border.
					cy.getByDataTest('border-control-width').eq(0).clear();
					cy.getByDataTest('border-control-width').eq(0).type(3);

					// Reselect.
					reSelectBlock();

					// Assert control value.
					cy.getByDataTest('border-control-width')
						.eq(0)
						.should('have.value', '3');
					cy.getByDataTest('border-control-width')
						.eq(1)
						.should('have.value', '5');
					cy.getByDataTest('border-control-color').should(
						'have.class',
						'is-empty'
					);
				}
			);

			context(
				'should correctly set attribute and generate styles for focus',
				() => {
					setDeviceType('Desktop');

					getWPDataObject().then((data) => {
						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}`)
							.should(
								'have.css',
								'border-top',
								'5px dotted rgb(17, 17, 17)'
							);

						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}`)
							.focus();

						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}:focus`)
							.should(
								'have.css',
								'border-top',
								'5px dotted rgb(17, 17, 17)'
							);
					});
				}
			);

			context(
				'should correctly set attribute and generate styles in all existed state',
				() => {
					setBlockState('Normal');

					// Assert block css when state is "Normal" and breakpoint is "Desktop".
					getWPDataObject().then((data) => {
						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}`)
							.should(
								'have.css',
								'border',
								'5px solid rgb(17, 17, 17)'
							);

						// Hover
						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}`)
							.realHover();
						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}:hover`)
							.should(
								'have.css',
								'border',
								'5px solid rgb(204, 204, 204)'
							);

						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}`)
							.realMouseMove(50, 50);

						// Focus
						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}`)
							.focus();
						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}:focus`)
							.should(
								'have.css',
								'border',
								'5px dotted rgb(17, 17, 17)'
							);
					});

					setBlockState('Focus');

					// Assert block css when state is "Focus" and breakpoint is "Desktop".
					getWPDataObject().then((data) => {
						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}`)
							.should(
								'have.css',
								'border',
								'5px dotted rgb(17, 17, 17)'
							);

						// Hover
						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}`)
							.realHover();
						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}:hover`)
							.should(
								'have.css',
								'border',
								'5px solid rgb(204, 204, 204)'
							);

						// Focus
						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}`)
							.focus();
						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}:focus`)
							.should(
								'have.css',
								'border',
								'5px dotted rgb(17, 17, 17)'
							);
					});

					setBlockState('Hover');

					// Assert block css when state is "Hover" and breakpoint is "Desktop".
					getWPDataObject().then((data) => {
						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}`)
							.should(
								'have.css',
								'border',
								'5px solid rgb(204, 204, 204)'
							);

						// Real hover
						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}`)
							.realHover();
						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}:hover`)
							.should(
								'have.css',
								'border',
								'5px solid rgb(204, 204, 204)'
							)
							.realMouseUp();

						// Focus
						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}`)
							.focus();
						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}:focus`)
							.should(
								'have.css',
								'border',
								'5px dotted rgb(17, 17, 17)'
							);
					});

					setBlockState('Focus');

					setDeviceType('Mobile');

					// Assert block css when state is "Focus" and breakpoint is "Desktop".
					getWPDataObject().then((data) => {
						// Focus
						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}`)
							.focus();
						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}:focus`)
							.should(
								'have.css',
								'border',
								'3px 5px 5px 5px dotted rgb(17, 17, 17)'
							);
					});

					// Asset store data
					getWPDataObject().then((data) => {
						expect({
							type: 'all',
							all: {
								width: '5px',
								style: 'solid',
								color: '',
							},
						}).to.be.deep.equal(
							getSelectedBlock(data, 'blockeraBorder')
						);

						expect({
							normal: {
								breakpoints: {
									desktop: { attributes: {} },
								},
								isVisible: true,
							},
							hover: {
								breakpoints: {
									desktop: {
										attributes: {
											blockeraBorder: {
												type: 'all',
												all: {
													width: '5px',
													style: 'solid',
													color: '#cccccc',
												},
											},
										},
									},
								},
								isVisible: true,
							},
							focus: {
								breakpoints: {
									desktop: {
										attributes: {
											blockeraBorder: {
												type: 'all',
												all: {
													width: '5px',
													style: 'dotted',
													color: '',
												},
											},
										},
									},
									mobile: {
										attributes: {
											blockeraBorder: {
												type: 'custom',
												all: {
													width: '5px',
													style: 'solid',
													color: '',
												},
												right: {
													width: '5px',
													style: 'solid',
													color: '',
												},
												bottom: {
													width: '5px',
													style: 'solid',
													color: '',
												},
												left: {
													width: '5px',
													style: 'solid',
													color: '',
												},
												top: {
													width: '3px',
													style: '',
													color: '',
												},
											},
										},
									},
								},
								isVisible: true,
							},
						}).to.be.deep.equal(
							getSelectedBlock(data, 'blockeraBlockStates')
						);
					});

					// frontend
					savePage();

					redirectToFrontPage();

					// FIXME: needs to fix responsive media queries config.
					// Set Desktop viewport
					cy.viewport(1025, 1200);
					cy.get('.blockera-block').should(
						'have.css',
						'border',
						'5px solid rgb(17, 17, 17)'
					);

					// Hover
					cy.get('.blockera-block').realHover();
					cy.get('.blockera-block')
						.should(
							'have.css',
							'border',
							'5px solid rgb(204, 204, 204)'
						)
						.realMouseUp();

					// Focus
					cy.get('.blockera-block').focus();
					cy.get('.blockera-block').should(
						'have.css',
						'border',
						'5px dotted rgb(17, 17, 17)'
					);

					// Set desktop viewport
					cy.viewport(1441, 1920);

					cy.get('.blockera-block').should(
						'have.css',
						'border',
						'5px solid rgb(17, 17, 17)'
					);

					// Hover
					// TODO:
					//cy.get('.blockera-block').realHover();
					// cy.get('.blockera-block')
					// 	.should(
					// 		'have.css',
					// 		'border',
					// 		'5px solid rgb(204, 204, 204)'
					// 	)
					// 	.realMouseUp();

					// Active
					// TODO:
					// cy.get('.blockera-block').realMouseDown();
					// cy.get('.blockera-block')
					// 	.should(
					// 		'have.css',
					// 		'border',
					// 		'5px dotted rgb(17, 17, 17)'
					// 	)
					// 	.realMouseUp();

					// set mobile viewport
					cy.viewport(320, 480);
					//TODO:
					// Active
					// cy.get('.blockera-block').realMouseDown();
					// cy.get('.blockera-block')
					// 	.should(
					// 		'have.css',
					// 		'border-top',
					// 		'3px solid rgb(17, 17, 17)'
					// 	)
					// 	.and(
					// 		'have.css',
					// 		'border-right',
					// 		'5px solid rgb(17, 17, 17)'
					// 	);
				}
			);
		});
	});
	describe('update repeater attributes in multiple states and devices', () => {
		const openBackgroundItem = () => {
			cy.getParentContainer('Image & Gradient').within(() => {
				cy.getByDataCy('group-control-header').click();
			});
		};
		context('Normal -> set background type', () => {
			beforeEach(() => {
				initialSetting();

				cy.getByAriaLabel('Add New Background').click();
				cy.getByAriaLabel('Linear Gradient').click();

				// Reselect
				reSelectBlock();

				// Assert control value
				cy.getParentContainer('Image & Gradient').within(() => {
					cy.getByDataCy('group-control-header').should(
						'have.length',
						'1'
					);
					cy.contains('Linear Gradient').should('exist');
				});
			});

			context('Hover -> set angle', () => {
				beforeEach(() => {
					addBlockState('hover');
					openBackgroundItem();
					cy.getByDataTest('popover-body').within(() => {
						cy.getByAriaLabel('Rotate Anti-clockwise').click();
					});

					// normal state updates should display
					cy.getParentContainer('Image & Gradient').within(() => {
						cy.getByDataCy('group-control-header').should(
							'have.length',
							'1'
						);
						cy.contains('Linear Gradient').should('exist');
					});

					// Reselect
					reSelectBlock();

					// Assert control value
					openBackgroundItem();
					cy.getByDataTest('popover-body').within(() => {
						cy.getParentContainer('Angel').within(() => {
							cy.get('input[inputmode="numeric"]').should(
								'have.value',
								'0'
							);
						});
					});
				});

				context('Active -> set repeat', () => {
					beforeEach(() => {
						addBlockState('active');
						openBackgroundItem();
						cy.getByDataTest('popover-body').within(() => {
							cy.get('button[aria-label="Repeat"]').click();

							// normal state updates should display
							cy.getByAriaLabel('Linear Gradient').should(
								'have.attr',
								'aria-checked',
								'true'
							);

							// hover state updates should not display
							cy.getParentContainer('Angel').within(() => {
								cy.get('input[inputmode="numeric"]').should(
									'have.value',
									'90'
								);
							});
						});

						// Reselect
						reSelectBlock();

						// Assert control value
						openBackgroundItem();
						cy.getByDataTest('popover-body').within(() => {
							cy.getParentContainer('Angel').within(() => {
								cy.get('input[inputmode="numeric"]').should(
									'have.value',
									'90'
								);
							});

							cy.get('button[aria-label="Repeat"]').should(
								'have.attr',
								'aria-checked',
								'true'
							);
						});
					});

					context('Active -> Mobile -> set effect', () => {
						beforeEach(() => {
							setDeviceType('Mobile');
							openBackgroundItem();

							cy.getByDataTest('popover-body').within(() => {
								cy.getByAriaLabel('Parallax').click();

								// active state updates should not display
								cy.getByAriaLabel('Repeat').should(
									'not.have.attr',
									'aria-checked',
									'true'
								);

								// hover state updates should not display
								cy.getParentContainer('Angel').within(() => {
									cy.get('input[inputmode="numeric"]').should(
										'have.value',
										'90'
									);
								});
							});

							reSelectBlock();

							// Assert control
							openBackgroundItem();
							cy.getByDataTest('popover-body').within(() => {
								cy.getByAriaLabel('Parallax').should(
									'have.attr',
									'aria-checked',
									'true'
								);
							});
						});

						it('should control value and attributes be correct, when navigate between states and devices', () => {
							// Active / Mobile
							// Assert block css
							getWPDataObject().then((data) => {
								cy.getIframeBody()
									.find(`#block-${getBlockClientId(data)}`)
									.should(
										'have.css',
										'background-attachment',
										'fixed'
									);

								// Active
								cy.getIframeBody()
									.find(`#block-${getBlockClientId(data)}`)
									.realMouseDown();

								cy.getIframeBody()
									.find(
										`#block-${getBlockClientId(
											data
										)}:active`
									)
									.should(
										'have.css',
										'background-attachment',
										'fixed'
									);
							});

							// Normal / Desktop
							setDeviceType('Desktop');
							setBlockState('Normal');
							// Assert block css
							getWPDataObject().then((data) => {
								cy.getIframeBody()
									.find(`#block-${getBlockClientId(data)}`)
									.should(
										'have.css',
										'background-image',
										'linear-gradient(90deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
									);

								// Hover
								cy.getIframeBody()
									.find(`#block-${getBlockClientId(data)}`)
									.realHover();

								cy.getIframeBody()
									.find(
										`#block-${getBlockClientId(data)}:hover`
									)
									.should(
										'have.css',
										'background-image',
										'linear-gradient(0deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
									)
									.realMouseMove(50, 50);

								// Active
								// TODO:
								// cy.getIframeBody()
								// 	.find(`#block-${getBlockClientId(data)}`)
								// 	.realMouseDown();

								// cy.getIframeBody()
								// 	.find(
								// 		`#block-${getBlockClientId(
								// 			data
								// 		)}:active`
								// 	)
								// 	.should(
								// 		'have.css',
								// 		'background-image',
								// 		'repeating-linear-gradient(90deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
								// 	)
								// 	.and(
								// 		'have.css',
								// 		'background-repeat',
								// 		'repeat'
								// 	);
							});

							// Assert control
							openBackgroundItem();
							cy.getByDataTest('popover-body').within(() => {
								cy.getByAriaLabel("Don't Repeat").should(
									'have.attr',
									'aria-checked',
									'true'
								);
								cy.getByAriaLabel('Parallax').should(
									'not.have.attr',
									'aria-checked',
									'true'
								);

								cy.getParentContainer('Angel').within(() => {
									cy.get('input[inputmode="numeric"]').should(
										'have.value',
										'90'
									);
								});
							});

							// Active / Desktop
							setBlockState('Active');
							// Assert block css
							//TODO
							// getWPDataObject().then((data) => {
							// 	cy.getIframeBody()
							// 		.find(`#block-${getBlockClientId(data)}`)
							// 		.should(
							// 			'have.css',
							// 			'background-image',
							// 			'repeating-linear-gradient(90deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
							// 		)
							// 		.and(
							// 			'have.css',
							// 			'background-repeat',
							// 			'repeat'
							// 		);

							// 	// Active
							// 	cy.getIframeBody()
							// 		.find(`#block-${getBlockClientId(data)}`)
							// 		.realMouseDown();

							// 	cy.getIframeBody()
							// 		.find(
							// 			`#block-${getBlockClientId(
							// 				data
							// 			)}:active`
							// 		)
							// 		.should(
							// 			'have.css',
							// 			'background-image',
							// 			'repeating-linear-gradient(90deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
							// 		)
							// 		.and(
							// 			'have.css',
							// 			'background-repeat',
							// 			'repeat'
							// 		)
							// 		.realMouseUp();
							// });

							//Assert control
							openBackgroundItem();
							cy.getByDataTest('popover-body').within(() => {
								cy.getByAriaLabel("Don't Repeat").should(
									'not.have.attr',
									'aria-checked',
									'true'
								);

								cy.getByAriaLabel('Parallax').should(
									'not.have.attr',
									'aria-checked',
									'true'
								);
							});

							// Hover / Desktop
							setBlockState('Hover');
							// Assert block css
							getWPDataObject().then((data) => {
								cy.getIframeBody()
									.find(`#block-${getBlockClientId(data)}`)
									.should(
										'have.css',
										'background-image',
										'linear-gradient(0deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
									);

								// Hover
								cy.getIframeBody()
									.find(`#block-${getBlockClientId(data)}`)
									.realHover();

								cy.getIframeBody()
									.find(
										`#block-${getBlockClientId(data)}:hover`
									)
									.should(
										'have.css',
										'background-image',
										'linear-gradient(0deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
									)
									.realMouseMove(50, 50);
							});

							// Assert control
							openBackgroundItem();
							cy.getByDataTest('popover-body').within(() => {
								cy.getByAriaLabel("Don't Repeat").should(
									'have.attr',
									'aria-checked',
									'true'
								);

								cy.getParentContainer('Angel').within(() => {
									cy.get('input[inputmode="numeric"]').should(
										'have.value',
										'0'
									);
								});

								cy.getByAriaLabel('Parallax').should(
									'not.have.attr',
									'aria-checked',
									'true'
								);
							});

							// Assert store data
							//TODO : normal/mobile should not exist in object
							// getWPDataObject().then((data) => {
							// 	expect({
							// 		'linear-gradient-0': {
							// 			isVisible: true,
							// 			'linear-gradient':
							// 				'linear-gradient(90deg,#009efa 10%,#e52e00 90%)',
							// 			'linear-gradient-angel': '90',
							// 			'linear-gradient-attachment': 'scroll',
							// 			'linear-gradient-repeat': 'no-repeat',
							// 			order: 0,
							// 			type: 'linear-gradient',
							// 		},
							// 	}).to.be.deep.equal(
							// 		getSelectedBlock(
							// 			data,
							// 			'blockeraBackground'
							// 		)
							// 	);

							// 	expect({
							// 		normal: {
							// 			breakpoints: {
							// 				desktop: { attributes: {} },
							// 			},
							// 			isVisible: true,
							// 		},
							// 		hover: {
							// 			breakpoints: {
							// 				desktop: {
							// 					attributes: {
							// 						blockeraBackground: {
							// 							'linear-gradient-0': {
							// 								isVisible: true,
							// 								'linear-gradient':
							// 									'linear-gradient(90deg,#009efa 10%,#e52e00 90%)',
							// 								'linear-gradient-angel': 0,
							// 								'linear-gradient-attachment':
							// 									'scroll',
							// 								'linear-gradient-repeat':
							// 									'no-repeat',
							// 								order: 0,
							// 								type: 'linear-gradient',
							// 							},
							// 						},
							// 					},
							// 				},
							// 			},
							// 			isVisible: true,
							// 		},
							// 		active: {
							// 			breakpoints: {
							// 				desktop: {
							// 					attributes: {
							// 						blockeraBackground: {
							// 							'linear-gradient-0': {
							// 								isVisible: true,
							// 								'linear-gradient':
							// 									'linear-gradient(90deg,#009efa 10%,#e52e00 90%)',
							// 								'linear-gradient-angel':
							// 									'90',
							// 								'linear-gradient-attachment':
							// 									'scroll',
							// 								'linear-gradient-repeat':
							// 									'repeat',
							// 								order: 0,
							// 								type: 'linear-gradient',
							// 							},
							// 						},
							// 					},
							// 				},
							// 				mobile: {
							// 					attributes: {
							// 						blockeraBackground: {
							// 							'linear-gradient-0': {
							// 								isVisible: true,
							// 								'linear-gradient':
							// 									'linear-gradient(90deg,#009efa 10%,#e52e00 90%)',
							// 								'linear-gradient-angel':
							// 									'90',
							// 								'linear-gradient-attachment':
							// 									'fixed',
							// 								'linear-gradient-repeat':
							// 									'no-repeat',
							// 								order: 0,
							// 								type: 'linear-gradient',
							// 							},
							// 						},
							// 					},
							// 				},
							// 			},
							// 			isVisible: true,
							// 		},
							// 	}).to.be.deep.equal(
							// 		getSelectedBlock(
							// 			data,
							// 			'blockeraBlockStates'
							// 		)
							// 	);
							// });

							// frontend
							savePage();

							redirectToFrontPage();

							// Assert in default viewport
							cy.viewport(1025, 1440);
							cy.get('.blockera-block').should(
								'have.css',
								'background-image',
								'linear-gradient(90deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
							);

							// Hover
							cy.get('.blockera-block').realHover();
							cy.get('.blockera-block')
								.should(
									'have.css',
									'background-image',
									'linear-gradient(0deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
								)
								.realMouseMove(50, 50);

							// Active
							cy.get('.blockera-block').realMouseDown();
							cy.get('.blockera-block')
								.should(
									'have.css',
									'background-image',
									'repeating-linear-gradient(90deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
								)
								.and('have.css', 'background-repeat', 'repeat')
								.realMouseUp();

							// Set desktop viewport
							cy.viewport(1441, 1920);
							cy.get('.blockera-block').should(
								'have.css',
								'background-image',
								'linear-gradient(90deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
							);

							//TODO
							// Hover
							//cy.get('.blockera-block').realHover();
							// cy.get('.blockera-block')
							// 	.should(
							// 		'have.css',
							// 		'background-image',
							// 		'linear-gradient(0deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
							// 	)
							// 	.realMouseUp();

							// Active
							//cy.get('.blockera-block').realMouseDown();
							// cy.get('.blockera-block')
							// 	.should(
							// 		'have.css',
							// 		'background-image',
							//      'repeating-linear-gradient(90deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
							// 	)
							// 	.and('have.css', 'background-repeat', 'repeat')
							// 	.realMouseUp();

							// set mobile viewport
							cy.viewport(380, 470);
							cy.get('.blockera-block').realMouseDown();
							cy.get('.blockera-block')
								.should(
									'have.css',
									'background-image',
									'linear-gradient(90deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
								)
								.and(
									'have.css',
									'background-attachment',
									'fixed'
								);
						});
					});
				});
			});
		});
	});
});
