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
	dismissOpenModals,
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
		const openBackgroundPanel = () => {
			openSettingsPanel('Background');
			cy.get('[aria-label="Image & Gradient"]', { timeout: 20000 })
				.closest('[data-cy=base-control]')
				.then(($el) => {
					$el[0].scrollIntoView({
						block: 'nearest',
						behavior: 'auto',
					});
				});
		};

		const dismissGroupPopover = () => {
			cy.get('body').type('{esc}', { force: true });
		};

		const clickBackgroundHeader = () => {
			openBackgroundPanel();
			cy.get('[aria-label="Image & Gradient"]')
				.closest('[data-cy=base-control]')
				.find('[data-cy="group-control-header"]')
				.first()
				.click({ force: true });
		};

		const selectMasterState = (state) => {
			dismissGroupPopover();
			cy.getByAriaLabel('Blockera Block State Container')
				.last()
				.find('[data-cy="group-control-header"]')
				.contains(state)
				.click({ force: true });
		};

		const insertState = (state) => {
			dismissGroupPopover();
			cy.getByDataTest('add-new-block-state')
				.last()
				.click({ force: true });
			cy.getByAriaLabel(state).click({ force: true });
		};

		const clickInBackgroundPopover = (ariaLabel) => {
			clickBackgroundHeader();
			// Field labels reuse the same aria-label as the option (e.g. Repeat).
			cy.get(`button[aria-label="${ariaLabel}"]`)
				.last()
				.click({ force: true });
			dismissGroupPopover();
		};

		beforeEach(() => {
			appendBlocks(
				`<!-- wp:paragraph -->
<p>Test</p>
<!-- /wp:paragraph -->`
			);
			cy.getBlock('core/paragraph').click({ force: true });
			cy.getByAriaControls('styles-view').click({ force: true });
			openBackgroundPanel();

			cy.getByAriaLabel('Add New Background').click({ force: true });
			cy.getByAriaLabel('Linear Gradient').click({ force: true });
			dismissGroupPopover();

			selectMasterState('Hover');
			clickInBackgroundPopover('Rotate Anti-clockwise');

			insertState('focus');
			clickInBackgroundPopover('Repeat');

			cy.getByAriaLabel('Mobile Portrait').click({ force: true });
			clickInBackgroundPopover('Parallax');
		});

		it('should control value and attributes be correct, when navigate between states and devices', () => {
			getWPDataObject().then((data) => {
				expect(
					getSelectedBlock(data, 'blockeraBlockStates')?.focus
						?.breakpoints?.mobile?.attributes?.blockeraBackground?.[
						'linear-gradient-0'
					]?.['linear-gradient-attachment']
				).to.eq('fixed');
			});

			cy.getByAriaLabel('Desktop').click({ force: true });
			selectMasterState('Normal');

			getWPDataObject().then((data) => {
				expect(getSelectedBlock(data, 'blockeraBackground')).to.deep.eq(
					{
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
					}
				);
			});

			selectMasterState('Focus');
			getWPDataObject().then((data) => {
				expect(
					getSelectedBlock(data, 'blockeraBlockStates')?.focus
						?.breakpoints?.desktop?.attributes
						?.blockeraBackground?.['linear-gradient-0']?.[
						'linear-gradient-repeat'
					]
				).to.eq('repeat');
			});

			selectMasterState('Hover');
			getWPDataObject().then((data) => {
				expect(
					getSelectedBlock(data, 'blockeraBlockStates')?.hover
						?.breakpoints?.desktop?.attributes
						?.blockeraBackground?.['linear-gradient-0']?.[
						'linear-gradient-angel'
					]
				).to.eq(45);
			});

			getWPDataObject().then((data) => {
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

			savePage();
			redirectToFrontPage();

			cy.viewport(1025, 1440);
			cy.get('.blockera-block').should(
				'have.css',
				'background-image',
				'linear-gradient(90deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
			);
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
