/**
 * External dependencies
 */
import 'cypress-real-events';

/**
 * Blockera dependencies
 */
import {
	getWPDataObject,
	getSelectedBlock,
	appendBlocks,
	setDeviceType,
	addBlockState,
	setBlockState,
	savePage,
	setInnerBlock,
	redirectToFrontPage,
	reSelectBlock,
	checkCurrentState,
	createPost,
	getBlockClientId,
	checkBlockCard,
} from '@blockera/dev-cypress/js/helpers';

describe('Inner Blocks E2E Test', () => {
	beforeEach(() => {
		createPost();
		cy.viewport(1440, 1025);

		// Match free inner-blocks block-states: keep secondary sidebar closed.
		cy.get('body').then(($body) => {
			const $toggle = $body.find(
				'[data-test="blockera-secondary-sidebar-toggle"][aria-pressed="true"]'
			);
			if ($toggle.length) {
				cy.getByDataTest('blockera-secondary-sidebar-toggle').click();
			}
		});
	});

	const initialSetting = () => {
		appendBlocks(
			`<!-- wp:paragraph {"className":"blockera-block blockera-block-10bb7854-c3bc-45cd-8202-b6b7c36c6b74","blockeraBlockStates":{"value":{}},"blockeraPropsId":"224185412280","blockeraCompatId":"224185412280"} -->
			<p class="blockera-block blockera-block-10bb7854-c3bc-45cd-8202-b6b7c36c6b74"><a href="#" data-type="post" data-id="5746" class="my-link">link</a></p>
			<!-- /wp:paragraph -->`
		);
		cy.getIframeBody().find('[data-type="core/paragraph"]').click();
		cy.getByAriaControls('styles-view').click();
		cy.addNewTransition();
	};

	const aliasBoxShadowContainer = () => {
		cy.getParentContainer('Box Shadows').as('box-shadow-container');
	};

	const aliasFilterContainer = () => {
		cy.getParentContainer('Filters').as('filter-container');
	};

	const assertVisibleRepeaterCount = (containerAlias, count) => {
		cy.get(containerAlias).scrollIntoView();
		cy.get(containerAlias).within(() => {
			cy.getByDataCy('group-control-header').should(($headers) => {
				expect($headers.filter(':visible')).to.have.length(count);
			});
		});
	};

	const assertVisibleRepeaterIncludesText = (containerAlias, text) => {
		cy.get(containerAlias).scrollIntoView();
		cy.get(containerAlias).within(() => {
			cy.getByDataCy('group-control-header').should(($headers) => {
				const $visible = $headers.filter(':visible');
				expect($visible.length).to.be.greaterThan(0);
				expect($visible.text()).to.include(text);
			});
		});
	};

	it('should control value and attributes be correct, when navigate between states and devices', () => {
		initialSetting();
		setInnerBlock('elements/link');

		// Alias
		aliasBoxShadowContainer();

		// add box shadow
		cy.getByAriaLabel('Add New Box Shadow').click();

		// alias
		cy.getByDataTest('popover-body').as('box-shadow-popover');

		// Set blur
		cy.getByDataTest('box-shadow-blur-input').type(`{selectall}20`);

		// Reselect
		reSelectBlock();
		setInnerBlock('elements/link');
		aliasBoxShadowContainer();

		// Assert control value
		assertVisibleRepeaterCount('@box-shadow-container', 1);
		assertVisibleRepeaterIncludesText('@box-shadow-container', '20');

		addBlockState('hover');
		reSelectBlock();
		setInnerBlock('elements/link');
		aliasBoxShadowContainer();

		assertVisibleRepeaterCount('@box-shadow-container', 1);

		// set x
		cy.openRepeaterItem('Box Shadows', 'Outer');

		cy.get('@box-shadow-popover').within(() => {
			// normal state updates should display
			cy.getByDataTest('box-shadow-blur-input').should(
				'have.value',
				'20'
			);

			cy.getByDataTest('box-shadow-x-input').type(`{selectall}5`);
		});

		// Reselect
		reSelectBlock();
		setInnerBlock('elements/link');

		// Assert control value
		cy.openRepeaterItem('Box Shadows', 'Outer');
		cy.get('@box-shadow-popover').within(() => {
			cy.getByDataTest('box-shadow-x-input').should('have.value', '5');
		});

		addBlockState('active');
		reSelectBlock();
		setInnerBlock('elements/link');
		aliasBoxShadowContainer();

		assertVisibleRepeaterCount('@box-shadow-container', 1);

		// hover state updates should not display
		cy.openRepeaterItem('Box Shadows', 'Outer');
		cy.get('@box-shadow-popover').within(() => {
			cy.getByDataTest('box-shadow-x-input').should(
				'not.have.value',
				'5'
			);

			// normal state updates should display
			cy.getByDataTest('box-shadow-blur-input').should(
				'have.value',
				'20'
			);
		});

		// Set data
		cy.getByAriaLabel('Add New Box Shadow').click();
		cy.get('@box-shadow-popover')
			.last()
			.within(() => {
				cy.getByAriaLabel('Inner').click();
			});

		// Reselect
		reSelectBlock();
		setInnerBlock('elements/link');

		// Assert control value
		checkCurrentState('active');
		aliasBoxShadowContainer();
		assertVisibleRepeaterCount('@box-shadow-container', 2);

		cy.openRepeaterItem('Box Shadows', 'Inner');
		cy.get('@box-shadow-popover').within(() => {
			cy.getByAriaLabel('Inner').should(
				'have.attr',
				'aria-checked',
				'true'
			);
		});

		setDeviceType('Tablet');

		reSelectBlock();
		setInnerBlock('elements/link');
		checkCurrentState('active');
		aliasBoxShadowContainer();

		// normal state updates should display
		assertVisibleRepeaterCount('@box-shadow-container', 1);
		assertVisibleRepeaterIncludesText('@box-shadow-container', 'Outer');

		cy.openRepeaterItem('Box Shadows', 'Outer');
		cy.get('@box-shadow-popover').within(() => {
			// hover state updates should not display
			cy.getByDataTest('box-shadow-x-input').should(
				'not.have.value',
				'5'
			);

			// normal state updates should display
			cy.getByDataTest('box-shadow-blur-input').should(
				'have.value',
				'20'
			);

			// Set y
			cy.getByDataTest('box-shadow-y-input').type('{selectall}50');
		});

		// Reselect
		reSelectBlock();
		setInnerBlock('elements/link');

		// Assert control value
		checkCurrentState('active');

		cy.openRepeaterItem('Box Shadows', 'Outer');
		cy.get('@box-shadow-popover').within(() => {
			cy.getByDataTest('box-shadow-blur-input').should(
				'have.value',
				'20'
			);

			cy.getByDataTest('box-shadow-x-input').should('have.value', '10');

			cy.getByDataTest('box-shadow-y-input').should('have.value', '50');
		});

		setBlockState('Normal');
		reSelectBlock();
		setInnerBlock('elements/link');
		aliasBoxShadowContainer();

		// should display only laptop / normal value
		assertVisibleRepeaterCount('@box-shadow-container', 1);
		assertVisibleRepeaterIncludesText('@box-shadow-container', 'Outer');
		cy.openRepeaterItem('Box Shadows', 'Outer');
		cy.get('@box-shadow-popover').within(() => {
			cy.getByDataTest('box-shadow-blur-input').should(
				'have.value',
				'20'
			);

			cy.getByDataTest('box-shadow-x-input').should('have.value', '10');
			cy.getByDataTest('box-shadow-y-input').should('have.value', '10');

			// Set blur
			cy.getByDataTest('box-shadow-blur-input').type('{selectall}30');

			// Set spread
			cy.getByDataTest('box-shadow-spread-input').type('{selectall}40');
		});

		// Assert block css (normal/tablet)
		getWPDataObject().then((data) => {
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.should(
					'have.css',
					'box-shadow',
					'rgba(0, 0, 0, 0.67) 10px 10px 30px 40px'
				);
		});

		setBlockState('Active');

		// Assert block css (active/tablet)
		getWPDataObject().then((data) => {
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.realMouseDown();
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.should(
					'have.css',
					'box-shadow',
					'rgba(0, 0, 0, 0.67) 10px 50px 20px 0px'
				);

			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.realMouseUp();
		});

		// Change to laptop device (active/desktop)
		setDeviceType('Desktop');
		reSelectBlock();
		setInnerBlock('elements/link');
		aliasBoxShadowContainer();

		// Assert control value
		assertVisibleRepeaterCount('@box-shadow-container', 2);

		cy.openRepeaterItem('Box Shadows', 'Outer');
		cy.get('@box-shadow-popover').within(() => {
			// overwrite normal/laptop value
			cy.getByDataTest('box-shadow-x-input').should('have.value', '10');

			cy.getByDataTest('box-shadow-y-input').should('have.value', '10');

			cy.getByDataTest('box-shadow-blur-input').should(
				'have.value',
				'20'
			);

			cy.getByDataTest('box-shadow-spread-input').should(
				'have.value',
				'0'
			);
		});

		cy.openRepeaterItem('Box Shadows', 'Inner');
		cy.get('@box-shadow-popover')
			.last()
			.within(() => {
				// default value
				cy.getByDataTest('box-shadow-x-input').should(
					'have.value',
					'10'
				);

				cy.getByDataTest('box-shadow-y-input').should(
					'have.value',
					'10'
				);

				cy.getByDataTest('box-shadow-blur-input').should(
					'have.value',
					'10'
				);

				cy.getByDataTest('box-shadow-spread-input').should(
					'have.value',
					'0'
				);
			});

		// Assert block css
		getWPDataObject().then((data) => {
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.should(
					'have.css',
					'box-shadow',
					'rgba(0, 0, 0, 0.67) 10px 10px 20px 0px, rgba(0, 0, 0, 0.67) 10px 10px 10px 0px inset'
				);
		});

		// Change to normal state (normal/laptop)
		setBlockState('Normal');
		reSelectBlock();
		setInnerBlock('elements/link');
		aliasBoxShadowContainer();

		// Assert control value
		assertVisibleRepeaterCount('@box-shadow-container', 1);

		cy.openRepeaterItem('Box Shadows', 'Outer');
		cy.get('@box-shadow-popover').within(() => {
			cy.getByDataTest('box-shadow-x-input').should('have.value', '10');

			cy.getByDataTest('box-shadow-y-input').should('have.value', '10');

			cy.getByDataTest('box-shadow-blur-input').should(
				'have.value',
				'20'
			);

			cy.getByDataTest('box-shadow-spread-input').should(
				'have.value',
				'0'
			);
		});

		// Assert block css
		getWPDataObject().then((data) => {
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.should(
					'have.css',
					'box-shadow',
					'rgba(0, 0, 0, 0.67) 10px 10px 20px 0px'
				);

			// Real hover
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.realHover();
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.should(
					'have.css',
					'box-shadow',
					'rgba(0, 0, 0, 0.67) 5px 10px 20px 0px'
				)
				.realMouseUp();
		});

		// Change to hover state (hover/laptop)
		setBlockState('Hover');
		reSelectBlock();
		setInnerBlock('elements/link');
		aliasBoxShadowContainer();

		// Assert control
		assertVisibleRepeaterCount('@box-shadow-container', 1);
		cy.openRepeaterItem('Box Shadows', 'Outer');
		cy.get('@box-shadow-popover').within(() => {
			cy.getByDataTest('box-shadow-x-input').should('have.value', '5');

			cy.getByDataTest('box-shadow-y-input').should('have.value', '10');

			cy.getByDataTest('box-shadow-blur-input').should(
				'have.value',
				'20'
			);

			cy.getByDataTest('box-shadow-spread-input').should(
				'have.value',
				'0'
			);
		});

		// Assert block css
		getWPDataObject().then((data) => {
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.should(
					'have.css',
					'box-shadow',
					'rgba(0, 0, 0, 0.67) 5px 10px 20px 0px'
				);

			// Real hover
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.realHover();
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.should(
					'have.css',
					'box-shadow',
					'rgba(0, 0, 0, 0.67) 5px 10px 20px 0px'
				)
				.realMouseUp();
		});

		// Assert data store
		getWPDataObject().then((data) => {
			expect({
				tablet: {
					attributes: {
						blockeraInnerBlocks: {
							'elements/link': {
								attributes: {
									blockeraBlockStates: {
										active: {
											breakpoints: {
												tablet: {
													attributes: {
														blockeraBoxShadow: {
															'outer-0': {
																isVisible: true,
																type: 'outer',
																x: '10px',
																y: '50px',
																blur: '20px',
																spread: '0px',
																color: '#000000ab',
																order: 0,
															},
														},
													},
												},
											},
											isVisible: true,
										},
									},
									blockeraBoxShadow: {
										'outer-0': {
											isVisible: true,
											type: 'outer',
											x: '10px',
											y: '10px',
											blur: '30px',
											spread: '40px',
											color: '#000000ab',
											order: 0,
										},
									},
								},
							},
						},
					},
				},
			}).to.be.deep.eq(
				getSelectedBlock(data, 'blockeraBlockStates').normal.breakpoints
			);

			expect({
				'elements/link': {
					attributes: {
						blockeraBoxShadow: {
							'outer-0': {
								isVisible: true,
								type: 'outer',
								x: '10px',
								y: '10px',
								blur: '20px',
								spread: '0px',
								color: '#000000ab',
								order: 0,
							},
						},
						blockeraBlockStates: {
							hover: {
								breakpoints: {
									desktop: {
										attributes: {
											blockeraBoxShadow: {
												'outer-0': {
													isVisible: true,
													type: 'outer',
													x: '5px',
													y: '10px',
													blur: '20px',
													spread: '0px',
													color: '#000000ab',
													order: 0,
												},
											},
										},
									},
								},
								isVisible: true,
							},
							active: {
								breakpoints: {
									desktop: {
										attributes: {
											blockeraBoxShadow: {
												'outer-0': {
													isVisible: true,
													type: 'outer',
													x: '10px',
													y: '10px',
													blur: '20px',
													spread: '0px',
													color: '#000000ab',
													order: 0,
												},
												'inner-0': {
													isVisible: true,
													type: 'inner',
													x: '10px',
													y: '10px',
													blur: '10px',
													spread: '0px',
													color: '#000000ab',
													order: 1,
												},
											},
										},
									},
								},
								isVisible: true,
							},
						},
					},
				},
			}).to.be.deep.eq(getSelectedBlock(data, 'blockeraInnerBlocks'));
		});

		// frontend
		savePage();

		redirectToFrontPage();

		// Assert in default viewport
		cy.viewport(1025, 1440);
		cy.get('.my-link').should(
			'have.css',
			'box-shadow',
			'rgba(0, 0, 0, 0.67) 10px 10px 20px 0px'
		);

		// Hover
		cy.get('.my-link').realHover();
		cy.get('.my-link')
			.should(
				'have.css',
				'box-shadow',
				'rgba(0, 0, 0, 0.67) 5px 10px 20px 0px'
			)
			.realMouseUp();

		// Active
		cy.get('.my-link').realMouseDown();
		cy.get('.my-link')
			.should(
				'have.css',
				'box-shadow',
				'rgba(0, 0, 0, 0.67) 10px 10px 20px 0px, rgba(0, 0, 0, 0.67) 10px 10px 10px 0px inset'
			)
			.realMouseUp();

		cy.go('back');

		// Set desktop viewport
		cy.viewport(1441, 1920);
		cy.get('.my-link').should(
			'have.css',
			'box-shadow',
			'rgba(0, 0, 0, 0.67) 10px 10px 20px 0px'
		);

		// Active
		cy.get('.my-link').realMouseDown();
		cy.get('.my-link')
			.should(
				'have.css',
				'box-shadow',
				'rgba(0, 0, 0, 0.67) 10px 10px 20px 0px, rgba(0, 0, 0, 0.67) 10px 10px 10px 0px inset'
			)
			.realMouseUp();

		// Hover
		cy.get('.my-link').realHover();
		cy.get('.my-link')
			.should(
				'have.css',
				'box-shadow',
				'rgba(0, 0, 0, 0.67) 5px 10px 20px 0px'
			)
			.realMouseUp();

		cy.go('back');

		//  set tablet viewport
		cy.viewport(768, 1024);

		// Active
		cy.get('.my-link').realMouseDown();
		cy.get('.my-link')
			.should(
				'have.css',
				'box-shadow',
				'rgba(0, 0, 0, 0.67) 10px 50px 20px 0px'
			)
			.realMouseUp();

		// Hover
		cy.get('.my-link').realHover();
		cy.get('.my-link')
			.should(
				'have.css',
				'box-shadow',
				'rgba(0, 0, 0, 0.67) 5px 10px 20px 0px'
			)
			.realMouseUp();

		cy.go('back');

		// Set mobile viewport (must inherit styles)
		cy.viewport(380, 470);

		cy.get('.my-link').should(
			'have.css',
			'box-shadow',
			'rgba(0, 0, 0, 0.67) 10px 10px 30px 40px'
		);

		// Hover
		cy.get('.my-link').realHover();
		cy.get('.my-link')
			.should(
				'have.css',
				'box-shadow',
				'rgba(0, 0, 0, 0.67) 5px 10px 20px 0px'
			)
			.realMouseUp();

		// Active
		cy.get('.my-link').realMouseDown();
		cy.get('.my-link')
			.should(
				'have.css',
				'box-shadow',
				'rgba(0, 0, 0, 0.67) 10px 50px 20px 0px'
			)
			.realMouseUp();
	});

	it('Normal → default breakpoint(laptop)', () => {
		initialSetting();
		addBlockState('hover');
		setInnerBlock('elements/link');

		// Set font-size
		cy.getParentContainer('Font Size').within(() => {
			cy.get('input[type="text"]').type('{selectall}25', { force: true });
		});

		// reselect
		reSelectBlock();
		setInnerBlock('elements/link');

		// Assert block css : inner
		getWPDataObject().then((data) => {
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)}`)
				.realHover();
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.should('have.css', 'font-size', '25px');
		});

		// Assert store data
		getWPDataObject().then((data) => {
			expect({
				blockeraInnerBlocks: {
					'elements/link': {
						attributes: {
							blockeraFontSize: '25px',
						},
					},
				},
			}).to.be.deep.equal(
				getSelectedBlock(data, 'blockeraBlockStates').hover.breakpoints
					.desktop.attributes
			);
		});

		// frontend
		savePage();

		redirectToFrontPage();

		// default viewport(laptop)
		cy.viewport(1025, 1440);

		// real hover
		cy.get('.blockera-block').realHover();
		cy.get('.my-link').should('have.css', 'font-size', '25px');

		// Set desktop viewport
		cy.viewport(1441, 1920);

		cy.get('.blockera-block').realHover();
		cy.get('.my-link').should('have.css', 'font-size', '25px');

		//  set Tablet viewport
		cy.viewport(768, 1024);
		cy.get('.blockera-block').realHover();
		cy.get('.my-link').should('have.css', 'font-size', '25px');
	});

	it('Normal → mobile breakpoint', () => {
		initialSetting();
		addBlockState('hover');
		setInnerBlock('elements/link');

		setDeviceType('Mobile Portrait');
		// Set font-size
		cy.getParentContainer('Font Size').within(() => {
			cy.get('input[type="text"]').type('{selectall}25', { force: true });
		});

		// reselect
		reSelectBlock();
		setInnerBlock('elements/link');

		// Assert block css : inner
		getWPDataObject().then((data) => {
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)}`)
				.realHover();
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.should('have.css', 'font-size', '25px');
		});

		// Assert store data
		getWPDataObject().then((data) => {
			expect({
				blockeraInnerBlocks: {
					'elements/link': {
						attributes: {
							blockeraFontSize: '25px',
						},
					},
				},
			}).to.be.deep.equal(
				getSelectedBlock(data, 'blockeraBlockStates').hover.breakpoints
					.mobile.attributes
			);
		});

		// frontend
		savePage();

		redirectToFrontPage();

		// default viewport(laptop)
		cy.viewport(1025, 1440);

		// real hover
		cy.get('.blockera-block').realHover();
		cy.get('.my-link').should('not.have.css', 'font-size', '25px');

		// Set desktop viewport
		cy.viewport(1441, 1920);

		cy.get('.blockera-block').realHover();
		cy.get('.my-link').should('not.have.css', 'font-size', '25px');

		//  set mobile viewport
		cy.viewport(320, 480);
		cy.get('.blockera-block').realHover();
		cy.get('.my-link').should('have.css', 'font-size', '25px');
	});

	it('Hover → mobile breakpoint', () => {
		initialSetting();
		addBlockState('hover');
		setInnerBlock('elements/link');

		addBlockState('hover');
		setDeviceType('Mobile Portrait');

		// Set font-size
		cy.getParentContainer('Font Size').within(() => {
			cy.get('input[type="text"]').type('{selectall}25', { force: true });
		});

		// reselect
		reSelectBlock();
		setInnerBlock('elements/link');

		// Assert block css : inner
		getWPDataObject().then((data) => {
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.realHover();
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.should('have.css', 'font-size', '25px');
		});

		// Assert store data
		getWPDataObject().then((data) => {
			expect({
				blockeraInnerBlocks: {
					'elements/link': {
						attributes: {
							blockeraBlockStates: {
								hover: {
									breakpoints: {
										mobile: {
											attributes: {
												blockeraFontSize: '25px',
											},
										},
									},
									isVisible: true,
								},
							},
						},
					},
				},
			}).to.be.deep.equal(
				getSelectedBlock(data, 'blockeraBlockStates').hover.breakpoints
					.mobile.attributes
			);
		});

		// frontend
		savePage();

		redirectToFrontPage();

		// default viewport(laptop)
		cy.viewport(1025, 1440);

		// real hover
		cy.get('.blockera-block').realHover();
		cy.get('.my-link')
			.realHover()
			.should('not.have.css', 'font-size', '25px');

		// Set desktop viewport
		cy.viewport(1441, 1920);

		cy.get('.blockera-block').realHover();
		cy.get('.my-link')
			.realHover()
			.should('not.have.css', 'font-size', '25px');

		//   set mobile viewport
		cy.viewport(320, 480);
		cy.get('.blockera-block').realHover();
		cy.get('.my-link').realHover().should('have.css', 'font-size', '25px');
	});

	it('should control value and styles be correct, when navigate between states and devices', () => {
		initialSetting();
		addBlockState('hover');
		setInnerBlock('elements/link');

		// Label renamed from "Border Line" → "Border" (matches free border e2e).
		cy.setInputFieldValue('Border', 'Border And Shadow', 2, true);
		cy.setInputFieldValue('Radius', 'Border And Shadow', 5, true);

		// Reselect
		reSelectBlock();
		setInnerBlock('elements/link');

		// Assert Control
		cy.checkInputFieldValue('Radius', 'Border And Shadow', 5);

		addBlockState('hover');

		// Normal state updates should display
		cy.checkInputFieldValue('Radius', 'Border And Shadow', 5);

		// Set
		cy.getByAriaLabel('Custom Border Radius').click({ force: true });
		cy.getParentContainer('Radius').within(() => {
			// Top Left
			cy.get('input[type="text"]')
				.eq(0)
				.type('{selectall}10', { force: true });
		});

		// Reselect
		reSelectBlock();
		setInnerBlock('elements/link');

		// Assert Control
		cy.getParentContainer('Radius').as('radius-container');
		cy.get('@radius-container').within(() => {
			// Top Left
			cy.get('input[type="text"]').eq(0).should('have.value', 10);
			cy.get('input[type="text"]').eq(1).should('have.value', 5);
			cy.get('input[type="text"]').eq(2).should('have.value', 5);
			cy.get('input[type="text"]').eq(3).should('have.value', 5);
		});

		addBlockState('focus');

		// Normal state updates should display
		cy.checkInputFieldValue('Radius', 'Border And Shadow', 5);

		// Hover state updates should not display
		cy.get('@radius-container').within(() => {
			cy.get('input[type="text"]').should('have.length', 1);
		});

		// Set
		cy.setInputFieldValue('Radius', 'Border And Shadow', 15, true);

		// Reselect
		reSelectBlock();
		setInnerBlock('elements/link');

		// Assert control
		cy.checkInputFieldValue('Radius', 'Border And Shadow', 15);

		setBlockState('Hover');
		setDeviceType('Mobile Portrait');

		// should not display any value
		cy.checkInputFieldValue('Radius', 'Border And Shadow', 5);

		// Hover state updates should not display
		cy.get('@radius-container').within(() => {
			cy.get('input[type="text"]').should('have.length', 1);
		});

		// Set
		cy.setInputFieldValue('Radius', 'Border And Shadow', 20, true);

		// Reselect
		reSelectBlock();
		setInnerBlock('elements/link');

		// Assert control
		cy.checkInputFieldValue('Radius', 'Border And Shadow', 20);

		setBlockState('Normal');

		// Should not display any value
		cy.checkInputFieldValue('Radius', 'Border And Shadow', 5);

		// Hover state updates should not display
		cy.get('@radius-container').within(() => {
			cy.get('input[type="text"]').should('have.length', 1);
		});

		// Set
		cy.getByAriaLabel('Custom Border Radius').click({ force: true });
		cy.getParentContainer('Radius').within(() => {
			// Bottom Right
			cy.get('input[type="text"]')
				.eq(3)
				.type('{selectall}30', { force: true });
		});

		// Reselect
		reSelectBlock();
		setInnerBlock('elements/link');

		cy.get('@radius-container').within(() => {
			cy.get('input[type="text"]').eq(0).should('have.value', 5);
			cy.get('input[type="text"]').eq(1).should('have.value', 5);
			cy.get('input[type="text"]').eq(2).should('have.value', 5);
			cy.get('input[type="text"]').eq(3).should('have.value', 30);
		});

		// normal / mobile;
		// Assert block css
		getWPDataObject().then((data) => {
			// Real hover
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)}`)
				.realHover();
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.should('have.css', 'border-bottom-right-radius', '30px')
				.realMouseUp();
		});

		// Change to focus state
		setBlockState('Focus');

		// (focus/mobile)
		// Assert control value (display normal/mobile value)
		cy.get('@radius-container').within(() => {
			cy.get('input[type="text"]').eq(0).should('have.value', 5);
			cy.get('input[type="text"]').eq(1).should('have.value', 5);
			cy.get('input[type="text"]').eq(2).should('have.value', 5);
			cy.get('input[type="text"]').eq(3).should('have.value', 30);
		});

		// No need to assert block css, no attribute updated

		// Change to hover state
		setBlockState('Hover');

		// (hover/mobile)
		// Assert control value
		cy.checkInputFieldValue('Radius', 'Border And Shadow', 20);

		// Assert block css
		getWPDataObject().then((data) => {
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.should('have.css', 'border-radius', '20px');

			//Real hover
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.realHover();
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.should('have.css', 'border-radius', '20px')
				.realMouseUp();
		});

		// Set device to default(Desktop)
		setDeviceType('Desktop');
		// (hover/Desktop)

		// Assert control
		cy.get('@radius-container').within(() => {
			cy.get('input[type="text"]').eq(0).should('have.value', 10);
			cy.get('input[type="text"]').eq(1).should('have.value', 5);
			cy.get('input[type="text"]').eq(2).should('have.value', 5);
			cy.get('input[type="text"]').eq(3).should('have.value', 5);
		});

		// Assert block css
		getWPDataObject().then((data) => {
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.should('have.css', 'border-radius', '10px 5px 5px');
			// Real hover
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.realHover();
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.should('have.css', 'border-radius', '10px 5px 5px')
				.realMouseUp();
		});

		// Change state to normal
		// (normal/desktop)
		setBlockState('Normal');

		// Assert control
		cy.checkInputFieldValue('Radius', 'Border And Shadow', 5);

		// Assert block css
		getWPDataObject().then((data) => {
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)}`)
				.realHover();
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.focus();
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.should('have.css', 'border-radius', '5px');
			cy.get('body').click();
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)}`)
				.realMouseUp();
		});

		// Change state to focus
		// (focus/desktop)
		setBlockState('Focus');

		// Assert control
		cy.checkInputFieldValue('Radius', 'Border And Shadow', 15);

		// Assert store data
		getWPDataObject().then((data) => {
			expect({
				desktop: {
					attributes: {
						blockeraInnerBlocks: {
							'elements/link': {
								attributes: {
									blockeraBorder: {
										type: 'all',
										all: {
											width: '2px',
											style: '',
											color: '',
										},
									},
									blockeraBorderRadius: {
										type: 'all',
										all: '5px',
									},
									blockeraBlockStates: {
										hover: {
											breakpoints: {
												desktop: {
													attributes: {
														blockeraBorderRadius: {
															type: 'custom',
															all: '5px',
															topLeft: '10px',
															topRight: '5px',
															bottomLeft: '5px',
															bottomRight: '5px',
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
														blockeraBorderRadius: {
															type: 'all',
															all: '15px',
														},
													},
												},
											},
											isVisible: true,
										},
									},
								},
							},
						},
					},
				},
				mobile: {
					attributes: {
						blockeraInnerBlocks: {
							'elements/link': {
								attributes: {
									blockeraBlockStates: {
										hover: {
											breakpoints: {
												mobile: {
													attributes: {
														blockeraBorderRadius: {
															type: 'all',
															all: '20px',
														},
													},
												},
											},
											isVisible: true,
										},
									},
									blockeraBorderRadius: {
										type: 'custom',
										all: '5px',
										topLeft: '5px',
										topRight: '5px',
										bottomLeft: '5px',
										bottomRight: '30px',
									},
								},
							},
						},
					},
				},
			}).to.be.deep.equal(
				getSelectedBlock(data, 'blockeraBlockStates').hover.breakpoints
			);
		});

		// frontend
		savePage();

		redirectToFrontPage();

		// Assert in default viewport
		cy.viewport(1025, 1440);

		cy.get('.blockera-block').realHover();
		cy.get('.my-link')
			.should('have.css', 'border-radius', '5px')
			.realMouseUp();

		// Hover
		cy.get('.my-link').realHover();
		cy.get('.my-link')
			.should('have.css', 'border-radius', '10px 5px 5px')
			.realMouseUp();

		// Focus
		cy.get('.my-link').focus();
		cy.get('.my-link').should('have.css', 'border-radius', '15px').blur();

		// Set desktop viewport
		cy.viewport(1441, 1920);

		cy.get('.blockera-block').realHover();
		cy.get('.my-link').should('have.css', 'border-radius', '5px');

		// Hover
		cy.get('.my-link').realHover();
		cy.get('.my-link')
			.should('have.css', 'border-radius', '10px 5px 5px')
			.realMouseUp();

		// Focus
		cy.get('.my-link').focus();
		cy.get('.my-link').should('have.css', 'border-radius', '15px').blur();

		// Set mobile viewport
		cy.viewport(380, 470);

		cy.get('.blockera-block').realHover();
		cy.get('.my-link')
			.should('have.css', 'border-bottom-right-radius', '30px')
			.realMouseUp();

		// Hover
		cy.get('.my-link').realHover();
		cy.get('.my-link')
			.should('have.css', 'border-radius', '20px')
			.realMouseUp();
	});

	it('should control value and styles be correct, when navigate between states and devices - 2', () => {
		initialSetting();
		addBlockState('hover');
		setInnerBlock('elements/link');

		// Alias
		aliasFilterContainer();
		cy.get('@filter-container').within(() => {
			cy.getByAriaLabel('Add New Filter Effect').click({
				force: true,
			});
			cy.getByDataCy('group-control-header').as('filter-items');
		});
		cy.getByDataTest('popover-body')
			.as('filter-popover')
			.within(() => {
				cy.getParentContainer('Type').within(() => {
					cy.get('select').as('type-select');
				});
			});

		// Set drop-shadow-x
		cy.get('@filter-popover').within(() => {
			cy.get('@type-select').select('drop-shadow', { force: true });

			cy.getByDataTest('filter-drop-shadow-x-input').type(
				'{selectall}20',
				{ force: true }
			);
		});

		// Reselect
		reSelectBlock();
		setInnerBlock('elements/link');

		// Assert control value
		cy.openRepeaterItem('Filters', 'Drop Shadow');
		cy.get('@filter-popover').within(() => {
			cy.getByDataTest('filter-drop-shadow-x-input').should(
				'have.value',
				20
			);
		});

		addBlockState('after');
		reSelectBlock();
		setInnerBlock('elements/link');
		aliasFilterContainer();

		// Normal state updates should display
		assertVisibleRepeaterCount('@filter-container', 1);
		cy.openRepeaterItem('Filters', 'Drop Shadow');
		cy.get('@filter-popover').within(() => {
			cy.getByDataTest('filter-drop-shadow-x-input').should(
				'have.value',
				20
			);

			// Set drop-shadow-y
			cy.getByDataTest('filter-drop-shadow-y-input').type(
				'{selectall}15'
			);
		});

		// Reselect
		reSelectBlock();
		setInnerBlock('elements/link');

		// Assert control
		cy.openRepeaterItem('Filters', 'Drop Shadow');
		cy.get('@filter-popover').within(() => {
			cy.getByDataTest('filter-drop-shadow-x-input').should(
				'have.value',
				20
			);

			cy.getByDataTest('filter-drop-shadow-y-input').should(
				'have.value',
				15
			);
		});

		addBlockState('focus');
		reSelectBlock();
		setInnerBlock('elements/link');
		aliasFilterContainer();

		// Normal state updates should display
		assertVisibleRepeaterCount('@filter-container', 1);
		cy.openRepeaterItem('Filters', 'Drop Shadow');
		cy.get('@filter-popover').within(() => {
			cy.getByDataTest('filter-drop-shadow-x-input').should(
				'have.value',
				20
			);

			//  After state updates should not display
			cy.getByDataTest('filter-drop-shadow-y-input').should(
				'not.have.value',
				15
			);
		});

		// Add new item
		cy.get('@filter-container').within(() => {
			cy.getByAriaLabel('Add New Filter Effect').click({ force: true });
		});
		cy.get('@filter-popover').each(() => {
			// Set blur
			cy.getByDataTest('filter-blur-input').type('{selectall}5');
		});

		// Reselect
		reSelectBlock();
		setInnerBlock('elements/link');
		aliasFilterContainer();

		// Assert control
		assertVisibleRepeaterCount('@filter-container', 2);

		cy.openRepeaterItem('Filters', 'Blur');
		cy.get('@filter-popover').within(() => {
			cy.getByDataTest('filter-blur-input').should('have.value', 5);
		});

		setBlockState('Normal');
		setDeviceType('Mobile Portrait');
		reSelectBlock();
		setInnerBlock('elements/link');
		aliasFilterContainer();

		// laptop/normal updates should display
		assertVisibleRepeaterCount('@filter-container', 1);
		cy.openRepeaterItem('Filters', 'Drop Shadow');
		cy.get('@filter-popover').within(() => {
			cy.getByDataTest('filter-drop-shadow-x-input').should(
				'have.value',
				20
			);

			cy.getByDataTest('filter-drop-shadow-y-input').should(
				'have.value',
				10
			);

			// Set blur
			cy.getByDataTest('filter-drop-shadow-blur-input').type(
				'{selectall}30'
			);

			// Update x
			cy.getByDataTest('filter-drop-shadow-x-input').type('{selectall}5');
		});

		// Reselect
		reSelectBlock();
		setInnerBlock('elements/link');

		// Assert control
		cy.openRepeaterItem('Filters', 'Drop Shadow');
		cy.get('@filter-popover').within(() => {
			cy.getByDataTest('filter-drop-shadow-x-input').should(
				'have.value',
				5
			);

			cy.getByDataTest('filter-drop-shadow-y-input').should(
				'have.value',
				10
			);

			cy.getByDataTest('filter-drop-shadow-blur-input').should(
				'have.value',
				30
			);
		});

		setBlockState('Focus');

		// mobile/normal updates should display
		cy.openRepeaterItem('Filters', 'Drop Shadow');
		cy.get('@filter-popover').within(() => {
			cy.getByDataTest('filter-drop-shadow-x-input').should(
				'have.value',
				5
			);

			cy.getByDataTest('filter-drop-shadow-y-input').should(
				'have.value',
				10
			);

			cy.getByDataTest('filter-drop-shadow-blur-input').should(
				'have.value',
				30
			);

			// Update y
			cy.getByDataTest('filter-drop-shadow-y-input').type(
				'{selectall}35'
			);
		});

		// Reselect
		reSelectBlock();
		setInnerBlock('elements/link');

		// Assert control
		cy.openRepeaterItem('Filters', 'Drop Shadow');
		cy.get('@filter-popover').within(() => {
			cy.getByDataTest('filter-drop-shadow-x-input').should(
				'have.value',
				5
			);

			cy.getByDataTest('filter-drop-shadow-y-input').should(
				'have.value',
				35
			);

			cy.getByDataTest('filter-drop-shadow-blur-input').should(
				'have.value',
				30
			);
		});
	});

	it('should not inherit data of normal state while current state in inner block is pseudo-element like "after" or "before"', () => {
		initialSetting();

		setInnerBlock('elements/link');

		setBlockState('Normal');

		cy.getParentContainer('Border').within(() => {
			cy.getByDataTest('border-control-width').type(5, { force: true });
		});

		addBlockState('after');

		cy.getParentContainer('Border').within(() => {
			cy.getByDataTest('border-control-width').should('have.value', '');
		});
	});
});
