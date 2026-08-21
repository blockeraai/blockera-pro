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
	openSettingsPanel,
} from '@blockera/dev-cypress/js/helpers';

describe('Block State E2E Test', () => {
	beforeEach(() => {
		cy.viewport(1440, 1025);

		createPost();
	});

	const initialSetting = () => {
		appendBlocks(
			`<!-- wp:paragraph -->
<p>Test</p>
<!-- /wp:paragraph -->`
		);
		cy.getBlock('core/paragraph').click();
		cy.getByAriaControls('styles-view').click();
		cy.addNewTransition();
	};

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
					setBlockState('Hover');

					cy.getByDataTest('border-control-color').click({
						force: true,
					});
					cy.getByDataTest('popover-body')
						.last()
						.should('be.visible')
						.within(() => {
							cy.getByDataCy('color-picker-css-value').clear({
								force: true,
							});
							cy.getByDataCy('color-picker-css-value').type(
								'ccc',
								{
									delay: 0,
									force: true,
								}
							);
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
						cy.getByDataTest('border-control-color')
							.parent()
							.next()
							.get('button')
							.eq(0)
							.click();

						// dotted border style.
						cy.get(
							'div[role="listbox"], ul[role="listbox"]'
						).within(() =>
							cy.get('div, li').eq(2).click({ force: true })
						);
					});

					reSelectBlock();

					cy.getByDataTest('border-control-component').within(() => {
						cy.getByDataTest('border-control-color')
							.parent()
							.next()
							.get('button')
							.eq(0)
							.click();

						// dotted border style.
						cy.get(
							'div[role="listbox"], ul[role="listbox"]'
						).within(() =>
							cy
								.get('div, li')
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
					setDeviceType('Mobile Portrait');

					cy.getByAriaLabel('Custom Box Border').click();

					// top border.
					cy.getByDataTest('border-control-width').eq(0).clear();
					cy.getByDataTest('border-control-width')
						.eq(0)
						.type(3, { force: true });

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
							.find(`#block-${getBlockClientId(data)}`)
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
							.find(`#block-${getBlockClientId(data)}`)
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
							.find(`#block-${getBlockClientId(data)}`)
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
							.find(`#block-${getBlockClientId(data)}`)
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
							.find(`#block-${getBlockClientId(data)}`)
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
							.find(`#block-${getBlockClientId(data)}`)
							.should(
								'have.css',
								'border',
								'5px solid rgb(204, 204, 204)'
							)
							.realMouseMove(50, 50);

						// Focus
						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}`)
							.focus();
						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}`)
							.should(
								'have.css',
								'border',
								'5px dotted rgb(17, 17, 17)'
							);
					});

					setBlockState('Focus');

					setDeviceType('Mobile Portrait');

					// Assert block css when state is "Focus" and breakpoint is "Mobile Portrait".
					getWPDataObject().then((data) => {
						// Focus
						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}`)
							.focus();
						cy.getIframeBody()
							.find(`#block-${getBlockClientId(data)}`)
							.should(
								'have.css',
								'border-top',
								'3px solid rgb(17, 17, 17)'
							);
					});

					// Asset store data
					getWPDataObject().then((data) => {
						expect({
							type: 'all',
							all: {
								width: '5px',
								style: '',
								color: '',
							},
						}).to.be.deep.equal(
							getSelectedBlock(data, 'blockeraBorder')
						);

						expect({
							hover: {
								breakpoints: {
									desktop: {
										attributes: {
											blockeraBorder: {
												type: 'all',
												all: {
													width: '5px',
													style: '',
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
													style: '',
													color: '',
												},
												right: {
													width: '5px',
													style: '',
													color: '',
												},
												bottom: {
													width: '5px',
													style: '',
													color: '',
												},
												left: {
													width: '5px',
													style: '',
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
					cy.get('.blockera-block').then(($el) => {
						$el[0].setAttribute('tabindex', 0);
					});
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
						'5px dotted rgb(17, 17, 17)'
					);

					cy.get('body').click();

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
					cy.get('.blockera-block').realMouseDown();
					cy.get('.blockera-block')
						.should(
							'have.css',
							'border',
							'5px dotted rgb(17, 17, 17)'
						)
						.realMouseUp();

					// set mobile viewport
					cy.viewport(320, 480);
					// Focus
					cy.get('.blockera-block').realMouseDown();
					cy.get('.blockera-block')
						.should(
							'have.css',
							'border-top',
							'3px solid rgb(17, 17, 17)'
						)
						.and(
							'have.css',
							'border-right',
							'5px solid rgb(17, 17, 17)'
						);
				}
			);
		});
	});
	describe('update repeater attributes in multiple states and devices', () => {
		const scrollBackgroundIntoView = () => {
			openSettingsPanel('Background');
			cy.getParentContainer('Image & Gradient').then(($container) => {
				$container[0].scrollIntoView({
					block: 'center',
					inline: 'nearest',
					behavior: 'auto',
				});
			});
			cy.getParentContainer('Image & Gradient')
				.scrollIntoView({ offset: { top: -300 }, duration: 0 })
				.should('be.visible');
		};

		const prepareBackgroundControls = () => {
			reSelectBlock();
			scrollBackgroundIntoView();
		};

		const assertVisibleRepeaterCount = (label, count) => {
			scrollBackgroundIntoView();
			cy.getParentContainer(label).within(() => {
				cy.getByDataCy('group-control-header', {
					timeout: 20000,
				}).should(($headers) => {
					expect($headers.filter(':visible')).to.have.length(count);
				});
			});
		};

		const openBackgroundItem = () => {
			scrollBackgroundIntoView();
			cy.getParentContainer('Image & Gradient').within(() => {
				cy.get('[data-cy="group-control-header"]:visible')
					.first()
					.click({ force: true });
			});
		};

		const assertBackgroundImage = (getSubject, expected) => {
			getSubject().should(($el) => {
				expect($el.css('background-image')).to.equal(expected);
			});
		};

		beforeEach(() => {
			initialSetting();
			scrollBackgroundIntoView();

			cy.getParentContainer('Image & Gradient').within(() => {
				cy.getByAriaLabel('Add New Background').click({ force: true });
			});
			cy.getByAriaLabel('Linear Gradient').click({ force: true });

			// Reselect
			prepareBackgroundControls();

			// Assert control value
			assertVisibleRepeaterCount('Image & Gradient', 1);
			cy.getParentContainer('Image & Gradient').within(() => {
				cy.contains('Linear Gradient').should('exist');
			});

			setBlockState('Hover');
			prepareBackgroundControls();
			openBackgroundItem();
			cy.getByDataTest('popover-body')
				.last()
				.within(() => {
					cy.getByAriaLabel('Rotate Anti-clockwise').click({
						force: true,
					});
				});

			// normal state updates should display
			assertVisibleRepeaterCount('Image & Gradient', 1);
			cy.getParentContainer('Image & Gradient').within(() => {
				cy.contains('Linear Gradient').should('exist');
			});

			// Reselect
			prepareBackgroundControls();

			// Assert control value
			openBackgroundItem();
			cy.getByDataTest('popover-body')
				.last()
				.within(() => {
					cy.getParentContainer('Angle').within(() => {
						cy.get('input[inputmode="numeric"]').should(
							'have.value',
							'45'
						);
					});
				});
			addBlockState('focus');
			prepareBackgroundControls();
			openBackgroundItem();
			cy.getByDataTest('popover-body')
				.last()
				.within(() => {
					cy.get('button[aria-label="Repeat"]').click({
						force: true,
					});

					// normal state updates should display
					cy.getByAriaLabel('Linear Gradient').should(
						'have.attr',
						'aria-checked',
						'true'
					);

					// hover state updates should not display
					cy.getParentContainer('Angle').within(() => {
						cy.get('input[inputmode="numeric"]').should(
							'have.value',
							'90'
						);
					});
				});

			// Reselect
			prepareBackgroundControls();

			// Assert control value
			openBackgroundItem();
			cy.getByDataTest('popover-body')
				.last()
				.within(() => {
					cy.getParentContainer('Angle').within(() => {
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

			setDeviceType('Mobile Portrait');
			prepareBackgroundControls();
			openBackgroundItem();

			cy.getByDataTest('popover-body')
				.last()
				.within(() => {
					cy.getByAriaLabel('Parallax').click({ force: true });

					// focus state updates should not display
					cy.getByAriaLabel('Repeat').should(
						'not.have.attr',
						'aria-checked',
						'true'
					);

					// hover state updates should not display
					cy.getParentContainer('Angle').within(() => {
						cy.get('input[inputmode="numeric"]').should(
							'have.value',
							'90'
						);
					});
				});

			prepareBackgroundControls();

			// Assert control
			openBackgroundItem();
			cy.getByDataTest('popover-body')
				.last()
				.within(() => {
					cy.getByAriaLabel('Parallax').should(
						'have.attr',
						'aria-checked',
						'true'
					);
				});
		});

		it('should control value and attributes be correct, when navigate between states and devices', () => {
			// Focus / Mobile
			// Assert block css
			getWPDataObject().then((data) => {
				const blockSelector = `#block-${getBlockClientId(data)}`;

				cy.getIframeBody()
					.find(blockSelector)
					.scrollIntoView()
					.should('have.css', 'background-attachment', 'fixed');

				// Focus
				cy.getIframeBody().find(blockSelector).realMouseDown();

				cy.getIframeBody()
					.find(blockSelector)
					.should('have.css', 'background-attachment', 'fixed')
					.realMouseMove(300, 300);
			});

			// Normal / Desktop
			setDeviceType('Desktop');
			setBlockState('Normal');
			prepareBackgroundControls();

			// Assert block css
			getWPDataObject().then((data) => {
				const blockSelector = `#block-${getBlockClientId(data)}`;

				assertBackgroundImage(
					() => cy.getIframeBody().find(blockSelector),
					'linear-gradient(90deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
				);

				// Hover
				cy.getIframeBody().find(blockSelector).safeRealHover();

				assertBackgroundImage(
					() => cy.getIframeBody().find(blockSelector),
					'linear-gradient(45deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
				);

				cy.getIframeBody().find(blockSelector).realMouseUp();

				// Focus
				// TODO: WordPress inline style override expected our styles.
				// cy.getIframeBody()
				// 	.find(`#block-${getBlockClientId(data)}`)
				// 	.realMouseDown();
				// cy.getIframeBody()
				// 	.find(`#block-${getBlockClientId(data)}`)
				// 	.should(
				// 		'have.css',
				// 		'background-image',
				// 		'repeating-linear-gradient(90deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
				// 	)
				// 	.and('have.css', 'background-repeat', 'repeat');
			});

			// Assert control
			openBackgroundItem();
			cy.getByDataTest('popover-body')
				.last()
				.within(() => {
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

					cy.getParentContainer('Angle').within(() => {
						cy.get('input[inputmode="numeric"]').should(
							'have.value',
							'90'
						);
					});
				});

			// Focus / Desktop
			setBlockState('Focus');
			prepareBackgroundControls();
			// Assert block css
			getWPDataObject().then((data) => {
				const blockSelector = `#block-${getBlockClientId(data)}`;
				// TODO: WordPress inline style override expected our styles.
				// cy.getIframeBody()
				// 	.find(`#block-${getBlockClientId(data)}`)
				// 	.should(
				// 		'have.css',
				// 		'background-image',
				// 		'repeating-linear-gradient(90deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
				// 	)
				// 	.and('have.css', 'background-repeat', 'repeat');

				// Focus
				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)}`)
					.realMouseDown();

				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)}`)
					.should(
						'have.css',
						'background-image',
						'repeating-linear-gradient(90deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
					)
					.and('have.css', 'background-repeat', 'repeat')
					.realMouseUp();
			});

			//Assert control
			openBackgroundItem();
			cy.getByDataTest('popover-body')
				.last()
				.within(() => {
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
			prepareBackgroundControls();
			// Assert block css
			getWPDataObject().then((data) => {
				const blockSelector = `#block-${getBlockClientId(data)}`;

				assertBackgroundImage(
					() => cy.getIframeBody().find(blockSelector),
					'linear-gradient(45deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
				);

				// Hover
				cy.getIframeBody().find(blockSelector).safeRealHover();

				assertBackgroundImage(
					() => cy.getIframeBody().find(blockSelector),
					'linear-gradient(45deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
				);

				cy.getIframeBody().find(blockSelector).realMouseMove(50, 50);
			});

			// Assert control
			openBackgroundItem();
			cy.getByDataTest('popover-body')
				.last()
				.within(() => {
					cy.getByAriaLabel("Don't Repeat").should(
						'have.attr',
						'aria-checked',
						'true'
					);

					cy.getParentContainer('Angle').within(() => {
						cy.get('input[inputmode="numeric"]').should(
							'have.value',
							'45'
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
			getWPDataObject().then((data) => {
				expect({
					'linear-gradient-0': {
						isVisible: true,
						'linear-gradient':
							'linear-gradient(90deg,#009efa 10%,#e52e00 90%)',
						'linear-gradient-angel': '90',
						'linear-gradient-attachment': 'scroll',
						'linear-gradient-repeat': 'no-repeat',
						order: 0,
						type: 'linear-gradient',
					},
				}).to.be.deep.equal(
					getSelectedBlock(data, 'blockeraBackground')
				);

				expect({
					hover: {
						breakpoints: {
							desktop: {
								attributes: {
									blockeraBackground: {
										'linear-gradient-0': {
											isVisible: true,
											'linear-gradient':
												'linear-gradient(90deg,#009efa 10%,#e52e00 90%)',
											'linear-gradient-angel': 45,
											'linear-gradient-attachment':
												'scroll',
											'linear-gradient-repeat':
												'no-repeat',
											order: 0,
											type: 'linear-gradient',
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
									blockeraBackground: {
										'linear-gradient-0': {
											isVisible: true,
											'linear-gradient':
												'linear-gradient(90deg,#009efa 10%,#e52e00 90%)',
											'linear-gradient-angel': '90',
											'linear-gradient-attachment':
												'scroll',
											'linear-gradient-repeat': 'repeat',
											order: 0,
											type: 'linear-gradient',
										},
									},
								},
							},
							mobile: {
								attributes: {
									blockeraBackground: {
										'linear-gradient-0': {
											isVisible: true,
											'linear-gradient':
												'linear-gradient(90deg,#009efa 10%,#e52e00 90%)',
											'linear-gradient-angel': '90',
											'linear-gradient-attachment':
												'fixed',
											'linear-gradient-repeat':
												'no-repeat',
											order: 0,
											type: 'linear-gradient',
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

			// Assert in default viewport
			cy.viewport(1025, 1440);
			cy.get('.blockera-block').should(
				'have.css',
				'background-image',
				'linear-gradient(90deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
			);

			// Hover
			cy.get('.blockera-block').safeRealHover();
			cy.get('.blockera-block')
				.should(
					'have.css',
					'background-image',
					'linear-gradient(45deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
				)
				.realMouseMove(50, 50);

			// Focus
			cy.get('.blockera-block').then(($el) => {
				$el[0].setAttribute('tabindex', 0);
			});
			cy.get('.blockera-block').focus();
			cy.get('.blockera-block')
				.should(
					'have.css',
					'background-image',
					'repeating-linear-gradient(90deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
				)
				.and('have.css', 'background-repeat', 'repeat');
			cy.get('body').click(); // Unfocus by clicking elsewhere

			// Set desktop viewport
			cy.viewport(1441, 1920);
			cy.get('.blockera-block').should(
				'have.css',
				'background-image',
				'linear-gradient(90deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
			);

			// Hover
			cy.get('.blockera-block').safeRealHover();
			cy.get('.blockera-block')
				.should(
					'have.css',
					'background-image',
					'linear-gradient(45deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
				)
				.realMouseUp();

			// Focus
			cy.get('.blockera-block').then(($el) => {
				$el[0].setAttribute('tabindex', 0);
			});
			cy.get('.blockera-block').focus();
			cy.get('.blockera-block')
				.should(
					'have.css',
					'background-image',
					'repeating-linear-gradient(90deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
				)
				.and('have.css', 'background-repeat', 'repeat');
			cy.get('body').click(); // Unfocus by clicking elsewhere

			// set mobile viewport
			cy.viewport(380, 470);
			cy.get('.blockera-block').realMouseDown();
			cy.get('.blockera-block')
				.should(
					'have.css',
					'background-image',
					'linear-gradient(90deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
				)
				.and('have.css', 'background-attachment', 'fixed');
		});
	});

	it('should not inherit data of normal state while current state in master block is pseudo-element like "after" or "before"', () => {
		initialSetting();

		setBlockState('Normal');

		cy.getByDataTest('border-control-width').type(5);

		addBlockState('after');

		cy.getByDataTest('border-control-width').should('have.value', '');
	});
});
