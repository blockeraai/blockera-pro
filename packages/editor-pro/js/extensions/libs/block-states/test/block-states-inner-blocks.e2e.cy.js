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
	});

	const initialSetting = () => {
		appendBlocks(
			`<!-- wp:paragraph {"className":"blockera-block blockera-block-10bb7854-c3bc-45cd-8202-b6b7c36c6b74","blockeraBlockStates":{"normal":{"breakpoints":{"laptop":{"attributes":{}}},"isVisible":true,"isSelected":true}},"blockeraPropsId":"224185412280","blockeraCompatId":"224185412280"} -->
			<p class="blockera-block blockera-block-10bb7854-c3bc-45cd-8202-b6b7c36c6b74"><a href="http://localhost/wordpress/2023/12/16/5746/" data-type="post" data-id="5746" class="my-link">link</a></p>
			<!-- /wp:paragraph -->`
		);
		cy.getIframeBody().find('[data-type="core/paragraph"]').click();
	};

	describe('Master → Normal → InnerBlock → update repeater attributes in multiple states and devices', () => {
		beforeEach(() => {
			initialSetting();
			setInnerBlock('elements/link');

			cy.getByAriaLabel('Add New Box Shadow').click();
			// Set blur
			cy.getByDataTest('box-shadow-blur-input').type(`{selectall}20`);

			// Alias
			cy.getParentContainer('Box Shadows').as('box-shadow-container');

			// Reselect
			reSelectBlock();
			setInnerBlock('elements/link');

			// Assert control value
			cy.get('@box-shadow-container').within(() => {
				cy.getByDataCy('group-control-header')
					.should('have.length', '1')
					.and('include.text', '20');
			});

			addBlockState('hover');

			cy.get('@box-shadow-container').within(() => {
				// normal state updates should display
				cy.getByDataCy('group-control-header').should(
					'have.length',
					'1'
				);
			});

			// set x
			cy.openRepeaterItem('Box Shadows', 'Outer');
			// alias
			cy.getByDataTest('popover-body').as('box-shadow-popover');
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
				cy.getByDataTest('box-shadow-x-input').should(
					'have.value',
					'5'
				);
			});

			addBlockState('active');

			cy.get('@box-shadow-container').within(() => {
				// normal state updates should display
				cy.getByDataCy('group-control-header').should(
					'have.length',
					'1'
				);
			});

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
			cy.get('@box-shadow-container').within(() => {
				cy.getByDataCy('group-control-header').should(
					'have.length',
					'2'
				);
			});

			cy.openRepeaterItem('Box Shadows', 'Inner');
			cy.get('@box-shadow-popover').within(() => {
				cy.getByAriaLabel('Inner').should(
					'have.attr',
					'aria-checked',
					'true'
				);
			});

			setDeviceType('Tablet');

			// normal state updates should display
			cy.get('@box-shadow-container').within(() => {
				cy.getByDataCy('group-control-header')
					.should('have.length', '1')
					.and('include.text', 'Outer');
			});

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

				cy.getByDataTest('box-shadow-x-input').should(
					'have.value',
					'10'
				);

				cy.getByDataTest('box-shadow-y-input').should(
					'have.value',
					'50'
				);
			});

			setBlockState('Normal');

			// should display only laptop / normal value
			cy.get('@box-shadow-container').within(() => {
				cy.getByDataCy('group-control-header')
					.should('have.length', '1')
					.and('include.text', 'Outer');
			});
			cy.openRepeaterItem('Box Shadows', 'Outer');
			cy.get('@box-shadow-popover').within(() => {
				cy.getByDataTest('box-shadow-blur-input').should(
					'have.value',
					'20'
				);

				cy.getByDataTest('box-shadow-x-input').should(
					'have.value',
					'10'
				);
				cy.getByDataTest('box-shadow-y-input').should(
					'have.value',
					'10'
				);

				// Set blur
				cy.getByDataTest('box-shadow-blur-input').type('{selectall}30');

				// Set spread
				cy.getByDataTest('box-shadow-spread-input').type(
					'{selectall}40'
				);
			});
		});

		it.only('should control value and attributes be correct, when navigate between states and devices', () => {
			// Assert block css (normal/tablet)
			getWPDataObject().then((data) => {
				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)} a`)
					.should(
						'have.css',
						'box-shadow',
						'rgba(0, 0, 0, 0.67) 10px 10px 30px 40px'
					);

				// Real active
				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)} a`)
					.realMouseDown();
				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)} a`)
					.should(
						'have.css',
						'box-shadow',
						'rgba(0, 0, 0, 0.67) 10px 50px 30px 40px'
					);
			});

			// Change to hover state (hover/tablet)
			setBlockState('Hover');

			// Assert control
			cy.openRepeaterItem('Box Shadows', 'Outer');
			cy.get('@box-shadow-popover').within(() => {
				// value displaying flow → normal / tablet → normal / laptop
				// should display  normal / tablet value here
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
					'30'
				);

				cy.getByDataTest('box-shadow-spread-input').should(
					'have.value',
					'40'
				);
			});

			// Change to active state (active/tablet)
			setBlockState('Active');

			// Assert block css (active/tablet)
			getWPDataObject().then((data) => {
				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)} a`)
					.should(
						'have.css',
						'box-shadow',
						'rgba(0, 0, 0, 0.67) 10px 50px 30px 40px'
					);

				// Real active
				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)} a`)
					.realMouseDown();
				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)} a`)
					.should(
						'have.css',
						'box-shadow',
						'rgba(0, 0, 0, 0.67) 10px 50px 30px 40px'
					);
			});

			// Assert control
			cy.openRepeaterItem('Box Shadows', 'Outer');
			cy.get('@box-shadow-popover').within(() => {
				// it has its own value
				cy.getByDataTest('box-shadow-x-input').should(
					'have.value',
					'10'
				);

				cy.getByDataTest('box-shadow-y-input').should(
					'have.value',
					'50'
				);

				cy.getByDataTest('box-shadow-blur-input').should(
					'have.value',
					'20'
				);

				cy.getByDataTest('box-shadow-spread-input').should(
					'have.value',
					'0'
				);
			});

			// Change to laptop device (active/laptop)
			setDeviceType('Laptop');

			// Assert control value
			cy.get('@box-shadow-container').within(() => {
				cy.getByDataCy('group-control-header').should(
					'have.length',
					'2'
				);
			});

			cy.openRepeaterItem('Box Shadows', 'Outer');
			cy.get('@box-shadow-popover').within(() => {
				// overwrite normal/laptop value
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

				// Real active
				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)} a`)
					.realMouseDown();
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

			// Assert control value
			cy.get('@box-shadow-container').within(() => {
				cy.getByDataCy('group-control-header').should(
					'have.length',
					'1'
				);
			});

			cy.openRepeaterItem('Box Shadows', 'Outer');
			cy.get('@box-shadow-popover').within(() => {
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

				// when real hover and active in normal state : should their css generate

				// Real active
				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)} a`)
					.realMouseDown();
				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)} a`)
					.should(
						'have.css',
						'box-shadow',
						'rgba(0, 0, 0, 0.67) 10px 10px 20px 0px, rgba(0, 0, 0, 0.67) 10px 10px 10px 0px inset'
					)
					.realMouseUp();

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

			// Assert control
			cy.get('@box-shadow-container').within(() => {
				cy.getByDataCy('group-control-header').should(
					'have.length',
					'1'
				);
			});
			cy.openRepeaterItem('Box Shadows', 'Outer');
			cy.get('@box-shadow-popover').within(() => {
				cy.getByDataTest('box-shadow-x-input').should(
					'have.value',
					'5'
				);

				cy.getByDataTest('box-shadow-y-input').should(
					'have.value',
					'10'
				);

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
								link: {
									attributes: {
										blockeraBoxShadow: {
											'outer-0': {
												type: 'outer',
												x: '10px',
												y: '10px',
												blur: '30px',
												spread: '40px',
												color: '#000000ab',
												isVisible: true,
												order: 0,
											},
										},
										blockeraBlockStates: {
											active: {
												breakpoints: {
													tablet: {
														attributes: {
															blockeraBoxShadow: {
																'outer-0': {
																	type: 'outer',
																	x: '10px',
																	y: '50px',
																	blur: '20px',
																	spread: '0px',
																	color: '#000000ab',
																	isVisible: true,
																	order: 0,
																},
															},
														},
													},
												},
											},
										},
									},
								},
							},
						},
					},
				}).to.be.deep.eq(
					getSelectedBlock(data, 'blockeraBlockStates').normal
						.breakpoints
				);

				expect({
					link: {
						attributes: {
							blockeraBoxShadow: {
								'outer-0': {
									type: 'outer',
									x: '10px',
									y: '10px',
									blur: '20px',
									spread: '0px',
									color: '#000000ab',
									isVisible: true,
									order: 0,
								},
							},
							blockeraBlockStates: {
								hover: {
									breakpoints: {
										laptop: {
											attributes: {
												blockeraBoxShadow: {
													'outer-0': {
														type: 'outer',
														x: '5px',
														y: '10px',
														blur: '20px',
														spread: '0px',
														color: '#000000ab',
														isVisible: true,
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
										laptop: {
											attributes: {
												blockeraBoxShadow: {
													'outer-0': {
														type: 'outer',
														x: '10px',
														y: '10px',
														blur: '20px',
														spread: '0px',
														color: '#000000ab',
														isVisible: true,
														order: 0,
													},
													'inner-0': {
														type: 'inner',
														x: '10px',
														y: '10px',
														blur: '10px',
														spread: '0px',
														color: '#000000ab',
														isVisible: true,
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

			//  set tablet viewport
			cy.viewport(768, 1024);
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
					'rgba(0, 0, 0, 0.67) 10px 10px 30px 40px'
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
					'rgba(0, 0, 0, 0.67) 10px 10px 30px 40px'
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
	});

	describe('Master → Pseudo State(hover) → InnerBlock', () => {
		beforeEach(() => {
			initialSetting();
			addBlockState('hover');
			setInnerBlock('elements/link');
		});
		it('Normal → default breakpoint(laptop)', () => {
			//
			checkBlockCard([
				{
					label: 'Hover',
					type: 'State',
				},
				{
					label: 'Link',
					type: 'Inner Block',
				},
			]);

			// Set font-size
			cy.setInputFieldValue('Font Size', 'Typography', 25);

			// reselect
			reSelectBlock();
			setInnerBlock('elements/link');

			// Assert control value
			cy.checkInputFieldValue('Font Size', 'Typography', 25);

			// Assert block css : inner
			getWPDataObject().then((data) => {
				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)}:hover a`)
					.should('have.css', 'font-size', '25px');
			});

			// Assert store data
			getWPDataObject().then((data) => {
				expect({
					blockeraInnerBlocks: {
						link: {
							attributes: {
								blockeraFontSize: '25px',
							},
						},
					},
				}).to.be.deep.equal(
					getSelectedBlock(data, 'blockeraBlockStates').hover
						.breakpoints.laptop.attributes
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
			//
			checkBlockCard([
				{
					label: 'Hover',
					type: 'State',
				},
				{
					label: 'Link',
					type: 'Inner Block',
				},
			]);

			setDeviceType('Mobile');
			// Set font-size
			cy.setInputFieldValue('Font Size', 'Typography', 25);

			// reselect
			reSelectBlock();
			setInnerBlock('elements/link');

			// Assert control value
			cy.checkInputFieldValue('Font Size', 'Typography', 25);

			// Assert block css : inner
			getWPDataObject().then((data) => {
				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)}:hover a`)
					.should('have.css', 'font-size', '25px');
			});

			// Assert store data
			getWPDataObject().then((data) => {
				expect({
					blockeraInnerBlocks: {
						link: {
							attributes: {
								blockeraFontSize: '25px',
							},
						},
					},
				}).to.be.deep.equal(
					getSelectedBlock(data, 'blockeraBlockStates').hover
						.breakpoints.mobile.attributes
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

		it('Hover → default breakpoint', () => {
			addBlockState('hover');

			//
			checkBlockCard([
				{
					label: 'Hover',
					type: 'State',
				},
				{
					label: 'Link',
					type: 'Inner Block',
				},
				{
					label: 'Hover',
					type: 'State',
				},
			]);

			// Set font-size
			cy.setInputFieldValue('Font Size', 'Typography', 25);

			// reselect
			reSelectBlock();
			setInnerBlock('elements/link');

			// Assert control value
			cy.checkInputFieldValue('Font Size', 'Typography', 25);
			checkCurrentState('hover');

			// Assert block css : inner
			getWPDataObject().then((data) => {
				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)} a`)
					.should('have.css', 'font-size', '25px');

				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)}`)
					.realHover();
				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)}:hover a`)
					.realHover();

				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)}:hover a:hover`)
					.should('have.css', 'font-size', '25px');
			});

			// Assert store data
			getWPDataObject().then((data) => {
				expect({
					blockeraInnerBlocks: {
						link: {
							attributes: {
								blockeraBlockStates: {
									hover: {
										breakpoints: {
											laptop: {
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
					getSelectedBlock(data, 'blockeraBlockStates').hover
						.breakpoints.laptop.attributes
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
				.should('have.css', 'font-size', '25px');

			// // Set desktop viewport
			cy.viewport(1441, 1920);

			cy.get('.blockera-block').realHover();
			cy.get('.my-link')
				.realHover()
				.should('have.css', 'font-size', '25px');

			//  set Tablet viewport
			cy.viewport(768, 1024);
			cy.get('.blockera-block').realHover();
			cy.get('.my-link')
				.realHover()
				.should('have.css', 'font-size', '25px');
		});

		it('Hover → mobile breakpoint', () => {
			addBlockState('hover');
			setDeviceType('Mobile');

			//
			checkBlockCard([
				{
					label: 'Hover',
					type: 'State',
				},
				{
					label: 'Link',
					type: 'Inner Block',
				},
				{
					label: 'Hover',
					type: 'State',
				},
			]);

			// Set font-size
			cy.setInputFieldValue('Font Size', 'Typography', 25);

			// reselect
			reSelectBlock();
			setInnerBlock('elements/link');

			// Assert control value
			cy.checkInputFieldValue('Font Size', 'Typography', 25);
			checkCurrentState('hover');

			// Assert block css : inner
			getWPDataObject().then((data) => {
				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)} a`)
					.should('have.css', 'font-size', '25px');

				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)}`)
					.realHover();
				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)}:hover a`)
					.realHover();

				cy.getIframeBody()
					.find(`#block-${getBlockClientId(data)}:hover a:hover`)
					.should('have.css', 'font-size', '25px');
			});

			// Assert store data
			getWPDataObject().then((data) => {
				expect({
					blockeraInnerBlocks: {
						link: {
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
									normal: {
										breakpoints: {
											laptop: {
												attributes: {},
											},
										},
										isVisible: true,
									},
								},
							},
						},
					},
				}).to.be.deep.equal(
					getSelectedBlock(data, 'blockeraBlockStates').hover
						.breakpoints.mobile.attributes
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
			cy.get('.my-link')
				.realHover()
				.should('have.css', 'font-size', '25px');
		});

		describe('update attributes in multiple states and devices', () => {
			context('Normal → set border radius', () => {
				beforeEach(() => {
					cy.setInputFieldValue('Radius', 'Border And Shadow', 5);

					// Reselect
					reSelectBlock();
					setInnerBlock('elements/link');

					// Assert Control
					cy.checkInputFieldValue('Radius', 'Border And Shadow', 5);
				});

				context('Hover → set custom radius', () => {
					beforeEach(() => {
						addBlockState('hover');
						//
						checkBlockCard([
							{
								label: 'Hover',
								type: 'State',
							},
							{
								label: 'Link',
								type: 'Inner Block',
							},
							{
								label: 'Hover',
								type: 'State',
							},
						]);

						// Normal state updates should display
						cy.checkInputFieldValue(
							'Radius',
							'Border And Shadow',
							5
						);

						// Set
						cy.getByAriaLabel('Custom Border Radius').click();
						cy.getParentContainer('Radius').within(() => {
							// Top Left
							cy.get('input[type="number"]')
								.eq(0)
								.type('{selectall}10');
						});

						// Reselect
						reSelectBlock();
						setInnerBlock('elements/link');

						// Assert Control
						checkCurrentState('hover');
						cy.getParentContainer('Radius').as('radius-container');
						cy.get('@radius-container').within(() => {
							// Top Left
							cy.get('input[type="number"]')
								.eq(0)
								.should('have.value', 10);
							cy.get('input[type="number"]')
								.eq(1)
								.should('have.value', 5);
							cy.get('input[type="number"]')
								.eq(2)
								.should('have.value', 5);
							cy.get('input[type="number"]')
								.eq(3)
								.should('have.value', 5);
						});
					});

					context('Focus → update border radius', () => {
						beforeEach(() => {
							addBlockState('Focus');
							//
							checkBlockCard([
								{
									label: 'Hover',
									type: 'State',
								},
								{
									label: 'Link',
									type: 'Inner Block',
								},
								{
									label: 'Focus',
									type: 'State',
								},
							]);

							// Normal state updates should display
							cy.checkInputFieldValue(
								'Radius',
								'Border And Shadow',
								5
							);

							// Hover state updates should not display
							cy.get('@radius-container').within(() => {
								cy.get('input[type="number"]').should(
									'have.length',
									1
								);
							});

							// Set
							cy.setInputFieldValue(
								'Radius',
								'Border And Shadow',
								15,
								true
							);

							// Reselect
							reSelectBlock();
							setInnerBlock('elements/link');

							// Assert control
							checkCurrentState('focus');
							cy.checkInputFieldValue(
								'Radius',
								'Border And Shadow',
								15
							);
						});

						context(
							'Hover → mobile → update border radius ',
							() => {
								beforeEach(() => {
									setBlockState('Hover');
									setDeviceType('Mobile');

									checkBlockCard([
										{
											label: 'Hover',
											type: 'State',
										},
										{
											label: 'Link',
											type: 'Inner Block',
										},
										{
											label: 'Hover',
											type: 'State',
										},
									]);

									// should not display any value
									cy.checkInputFieldValue(
										'Radius',
										'Border And Shadow',
										''
									);

									// Hover state updates should not display
									cy.get('@radius-container').within(() => {
										cy.get('input[type="number"]').should(
											'have.length',
											1
										);
									});

									// Set
									cy.setInputFieldValue(
										'Radius',
										'Border And Shadow',
										20
									);

									// Reselect
									reSelectBlock();
									setInnerBlock('elements/link');

									// Assert control
									checkCurrentState('hover');
									cy.checkInputFieldValue(
										'Radius',
										'Border And Shadow',
										20
									);
								});

								context(
									'Mobile → Normal → set custom radius',
									() => {
										beforeEach(() => {
											setBlockState('Normal');
											//
											checkBlockCard([
												{
													label: 'Hover',
													type: 'State',
												},
												{
													label: 'Link',
													type: 'Inner Block',
												},
											]);

											// Should not display any value
											cy.checkInputFieldValue(
												'Radius',
												'Border And Shadow',
												''
											);

											// Hover state updates should not display
											cy.get('@radius-container').within(
												() => {
													cy.get(
														'input[type="number"]'
													).should('have.length', 1);
												}
											);

											// Set
											cy.getByAriaLabel(
												'Custom Border Radius'
											).click();
											cy.getParentContainer(
												'Radius'
											).within(() => {
												// Bottom Right
												cy.get('input[type="number"]')
													.eq(3)
													.type('{selectall}30');
											});

											// Reselect
											reSelectBlock();
											setInnerBlock('elements/link');

											// Assert Control
											checkCurrentState('normal');

											cy.get('@radius-container').within(
												() => {
													cy.get(
														'input[type="number"]'
													)
														.eq(0)
														.should(
															'have.value',
															''
														);
													cy.get(
														'input[type="number"]'
													)
														.eq(1)
														.should(
															'have.value',
															''
														);
													cy.get(
														'input[type="number"]'
													)
														.eq(2)
														.should(
															'have.value',
															''
														);
													cy.get(
														'input[type="number"]'
													)
														.eq(3)
														.should(
															'have.value',
															30
														);
												}
											);
										});

										it('should control value and styles be correct, when navigate between states and devices', () => {
											normal / mobile;
											// Assert block css
											getWPDataObject().then((data) => {
												cy.getIframeBody()
													.find(
														`#block-${getBlockClientId(
															data
														)} a`
													)
													.should(
														'have.css',
														'border-bottom-right-radius',
														'30px'
													);
												// Real hover
												cy.getIframeBody()
													.find(
														`#block-${getBlockClientId(
															data
														)}`
													)
													.realHover();
												cy.getIframeBody()
													.find(
														`#block-${getBlockClientId(
															data
														)}:hover a`
													)
													.should(
														'have.css',
														'border-bottom-right-radius',
														'30px'
													);
											});

											// Change to focus state
											setBlockState('Focus');

											// (focus/mobile)
											// Assert control value (display normal/mobile value)
											cy.get('@radius-container').within(
												() => {
													cy.get(
														'input[type="number"]'
													)
														.eq(0)
														.should(
															'have.value',
															''
														);
													cy.get(
														'input[type="number"]'
													)
														.eq(1)
														.should(
															'have.value',
															''
														);
													cy.get(
														'input[type="number"]'
													)
														.eq(2)
														.should(
															'have.value',
															''
														);
													cy.get(
														'input[type="number"]'
													)
														.eq(3)
														.should(
															'have.value',
															30
														);
												}
											);

											// No need to assert block css, no attribute updated

											// Change to hover state
											setBlockState('Hover');

											// (hover/mobile)
											// Assert control value
											cy.checkInputFieldValue(
												'Radius',
												'Border And Shadow',
												20
											);

											// Assert block css
											getWPDataObject().then((data) => {
												cy.getIframeBody()
													.find(
														`#block-${getBlockClientId(
															data
														)} a`
													)
													.should(
														'have.css',
														'border-radius',
														'20px'
													);

												//Real hover
												cy.getIframeBody()
													.find(
														`#block-${getBlockClientId(
															data
														)}`
													)
													.realHover();
												cy.getIframeBody()
													.find(
														`#block-${getBlockClientId(
															data
														)} a`
													)
													.realHover();
												cy.getIframeBody()
													.find(
														`#block-${getBlockClientId(
															data
														)}:hover a:hover`
													)
													.should(
														'have.css',
														'border-radius',
														'20px'
													);
											});

											// Set device to default(laptop)
											setDeviceType('Laptop');
											// (hover/laptop)

											// Assert control
											cy.get('@radius-container').within(
												() => {
													cy.get(
														'input[type="number"]'
													)
														.eq(0)
														.should(
															'have.value',
															10
														);
													cy.get(
														'input[type="number"]'
													)
														.eq(1)
														.should(
															'have.value',
															5
														);
													cy.get(
														'input[type="number"]'
													)
														.eq(2)
														.should(
															'have.value',
															5
														);
													cy.get(
														'input[type="number"]'
													)
														.eq(3)
														.should(
															'have.value',
															5
														);
												}
											);

											// Assert block css
											getWPDataObject().then((data) => {
												cy.getIframeBody()
													.find(
														`#block-${getBlockClientId(
															data
														)} a`
													)
													.should(
														'have.css',
														'border-radius',
														'10px 5px 5px 5px'
													);
												// Real hover
												cy.getIframeBody()
													.find(
														`#block-${getBlockClientId(
															data
														)}`
													)
													.realHover();
												cy.getIframeBody()
													.find(
														`#block-${getBlockClientId(
															data
														)} a`
													)
													.realHover();
												cy.getIframeBody()
													.find(
														`#block-${getBlockClientId(
															data
														)}:hover a:hover`
													)
													.should(
														'have.css',
														'border-radius',
														'10px 5px 5px 5px'
													);
											});

											// Change state to normal
											// (normal/laptop)
											setBlockState('Normal');

											// Assert control
											cy.checkInputFieldValue(
												'Radius',
												'Border And Shadow',
												5
											);

											// Assert block css
											getWPDataObject().then((data) => {
												cy.getIframeBody()
													.find(
														`#block-${getBlockClientId(
															data
														)} a`
													)
													.should(
														'have.css',
														'border-radius',
														'5px'
													);
												//Real hover
												cy.getIframeBody()
													.find(
														`#block-${getBlockClientId(
															data
														)}`
													)
													.realHover();
												cy.getIframeBody()
													.find(
														`#block-${getBlockClientId(
															data
														)}:hover a`
													)
													.should(
														'have.css',
														'border-radius',
														'5px'
													);
											});

											// Change state to focus
											// (focus/laptop)
											setBlockState('Focus');

											// Assert control
											cy.checkInputFieldValue(
												'Radius',
												'Border And Shadow',
												15
											);

											// Assert block css
											getWPDataObject().then((data) => {
												cy.getIframeBody()
													.find(
														`#block-${getBlockClientId(
															data
														)} a`
													)
													.should(
														'have.css',
														'border-radius',
														'15px'
													);
												// Real hover
												cy.getIframeBody()
													.find(
														`#block-${getBlockClientId(
															data
														)}`
													)
													.realHover();
												// Focus
												cy.getIframeBody()
													.find(
														`#block-${getBlockClientId(
															data
														)} a`
													)
													.focus();
												cy.getIframeBody()
													.find(
														`#block-${getBlockClientId(
															data
														)}:hover a:focus`
													)
													.should(
														'have.css',
														'border-radius',
														'15px'
													);
											});

											// Assert store data
											getWPDataObject().then((data) => {
												expect({
													desktop: {
														attributes: {
															blockeraInnerBlocks:
																{
																	link: {
																		attributes:
																			{
																				blockeraBorderRadius:
																					{
																						type: 'all',
																						all: '5px',
																					},
																				blockeraBlockStates:
																					{
																						focus: {
																							isVisible: true,
																							breakpoints:
																								{
																									laptop: {
																										attributes:
																											{
																												blockeraBorderRadius:
																													{
																														type: 'all',
																														all: '15px',
																													},
																											},
																									},
																								},
																						},
																						hover: {
																							isVisible: true,
																							breakpoints:
																								{
																									laptop: {
																										attributes:
																											{
																												blockeraBorderRadius:
																													{
																														type: 'custom',
																														all: '5px',
																														topLeft:
																															'10px',
																														topRight:
																															'5px',
																														bottomLeft:
																															'5px',
																														bottomRight:
																															'5px',
																													},
																											},
																									},
																									mobile: {
																										attributes:
																											{
																												blockeraBorderRadius:
																													{
																														type: 'all',
																														all: '20px',
																													},
																											},
																									},
																								},
																						},
																						normal: {
																							isVisible: true,
																							breakpoints:
																								{
																									laptop: {
																										attributes:
																											{},
																									},
																								},
																						},
																					},
																			},
																	},
																},
														},
													},
													mobile: {
														attributes: {
															blockeraInnerBlocks:
																{
																	link: {
																		attributes:
																			{
																				blockeraBorderRadius:
																					{
																						type: 'custom',
																						all: '',
																						topLeft:
																							'',
																						topRight:
																							'',
																						bottomLeft:
																							'',
																						bottomRight:
																							'30px',
																					},
																				blockeraBlockStates:
																					{
																						focus: {
																							breakpoints:
																								{
																									laptop: {
																										attributes:
																											{
																												blockeraBorderRadius:
																													{
																														type: 'all',
																														all: '15px',
																													},
																											},
																									},
																								},
																							isVisible: true,
																						},
																						hover: {
																							breakpoints:
																								{
																									laptop: {
																										attributes:
																											{
																												blockeraBorderRadius:
																													{
																														type: 'custom',
																														all: '5px',
																														topLeft:
																															'10px',
																														topRight:
																															'5px',
																														bottomLeft:
																															'5px',
																														bottomRight:
																															'5px',
																													},
																											},
																									},
																									mobile: {
																										attributes:
																											{
																												blockeraBorderRadius:
																													{
																														type: 'all',
																														all: '20px',
																													},
																											},
																									},
																								},
																							isVisible: true,
																						},
																						normal: {
																							breakpoints:
																								{
																									laptop: {
																										attributes:
																											{},
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
												}).to.be.deep.equal(
													getSelectedBlock(
														data,
														'blockeraBlockStates'
													).hover.breakpoints
												);
											});

											// frontend
											savePage();

											redirectToFrontPage();

											// Assert in default viewport
											cy.viewport(1025, 1440);
											cy.get(
												'.blockera-block'
											).realHover();

											cy.get('.my-link').should(
												'have.css',
												'border-radius',
												'5px'
											);

											// Hover
											cy.get('.my-link').realHover();
											cy.get('.my-link')
												.should(
													'have.css',
													'border-radius',
													'10px 5px 5px 5px'
												)
												.realMouseUp();

											// Focus
											cy.get('.my-link').focus();
											cy.get('.my-link')
												.should(
													'have.css',
													'border-radius',
													'15px'
												)
												.realMouseUp();

											// Set desktop viewport
											cy.viewport(1441, 1920);
											cy.get(
												'.blockera-block'
											).realHover();

											cy.get('.my-link').should(
												'have.css',
												'border-radius',
												'5px'
											);

											// Hover
											cy.get('.my-link').realHover();
											cy.get('.my-link')
												.should(
													'have.css',
													'border-radius',
													'10px 5px 5px 5px'
												)
												.realMouseUp();

											// Focus
											cy.get('.my-link').focus();
											cy.get('.my-link')
												.should(
													'have.css',
													'border-radius',
													'15px'
												)
												.realMouseUp();

											// Set mobile viewport
											cy.viewport(380, 470);
											cy.get(
												'.blockera-block'
											).realHover();

											cy.get('.my-link').should(
												'have.css',
												'border-bottom-right-radius',
												'30px'
											);

											// Hover
											cy.get('.my-link').realHover();
											cy.get('.my-link')
												.should(
													'have.css',
													'border-radius',
													'2px'
												)
												.realMouseUp();
										});
									}
								);
							}
						);
					});
				});
			});
		});

		describe('update repeater attributes in multiple states and devices', () => {
			context('Normal → add filter item → set drop-shadow-x = 20', () => {
				beforeEach(() => {
					//
					checkBlockCard([
						{
							label: 'Hover',
							type: 'State',
						},
						{
							label: 'Link',
							type: 'Inner Block',
						},
					]);

					// Add item
					cy.getByAriaLabel('Add New Filter Effect').click();

					// Alias
					cy.getParentContainer('Filters')
						.as('filter-container')
						.within(() =>
							cy
								.getByDataCy('group-control-header')
								.as('filter-items')
						);
					cy.getByDataTest('popover-body')
						.as('filter-popover')
						.within(() => {
							cy.getParentContainer('Type').within(() => {
								cy.get('select').as('type-select');
							});
						});

					// Set drop-shadow-x
					cy.get('@filter-popover').within(() => {
						cy.get('@type-select').select('drop-shadow');

						cy.getByDataTest('filter-drop-shadow-x-input').type(
							'{selectall}20'
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
				});

				context('After → set drop-shadow-y = 15', () => {
					beforeEach(() => {
						addBlockState('after');
						//
						checkBlockCard([
							{
								label: 'Hover',
								type: 'State',
							},
							{
								label: 'Link',
								type: 'Inner Block',
							},
							{
								label: 'After',
								type: 'State',
							},
						]);

						// Normal state updates should display
						cy.get('@filter-items').should('have.length', '1');
						cy.openRepeaterItem('Filters', 'Drop Shadow');
						cy.get('@filter-popover').within(() => {
							cy.getByDataTest(
								'filter-drop-shadow-x-input'
							).should('have.value', 20);

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
							cy.getByDataTest(
								'filter-drop-shadow-x-input'
							).should('have.value', 20);

							cy.getByDataTest(
								'filter-drop-shadow-y-input'
							).should('have.value', 15);
						});
					});

					context('Focus → add new item → set blur = 5', () => {
						beforeEach(() => {
							addBlockState('focus');
							//
							checkBlockCard([
								{
									label: 'Hover',
									type: 'State',
								},
								{
									label: 'Link',
									type: 'Inner Block',
								},
								{
									label: 'Focus',
									type: 'State',
								},
							]);

							// Normal state updates should display
							cy.get('@filter-items').should('have.length', '1');
							cy.openRepeaterItem('Filters', 'Drop Shadow');
							cy.get('@filter-popover').within(() => {
								cy.getByDataTest(
									'filter-drop-shadow-x-input'
								).should('have.value', 20);

								//  After state updates should not display
								cy.getByDataTest(
									'filter-drop-shadow-y-input'
								).should('not.have.value', 15);
							});

							// Add new item
							cy.getByAriaLabel('Add New Filter Effect');
							cy.get('@filter-popover').within(() => {
								// Set blur
								cy.getByDataTest('filter-blur-input').type(
									'{selectall}5'
								);
							});

							// Reselect
							reSelectBlock();
							setInnerBlock('elements/link');

							// Assert control
							cy.get('@filter-items').should('have.length', '2');

							cy.openRepeaterItem('Filters', 'Blur');
							cy.get('@filter-popover').within(() => {
								cy.getByDataTest('filter-blur-input').should(
									'have.value',
									5
								);
							});
						});

						context(
							'Normal → Mobile → set drop-shadow-blur = 30 & update drop-shadow-x = 5',
							() => {
								beforeEach(() => {
									setBlockState('Normal');
									setDeviceType('Mobile');
									//
									checkBlockCard([
										{
											label: 'Hover',
											type: 'State',
										},
										{
											label: 'Link',
											type: 'Inner Block',
										},
									]);

									// laptop/normal updates should display
									cy.get('@filter-items').should(
										'have.length',
										1
									);
									cy.openRepeaterItem(
										'Filters',
										'Drop Shadow'
									);
									cy.get('@filter-popover').within(() => {
										cy.getByDataTest(
											'filter-drop-shadow-x-input'
										).should('have.value', 20);

										cy.getByDataTest(
											'filter-drop-shadow-y-input'
										).should('have.value', 15);

										// Set blur
										cy.getByDataTest(
											'filter-drop-shadow-blur-input'
										).type('{selectall}30');

										// Update x
										cy.getByDataTest(
											'filter-drop-shadow-x-input'
										).type('{selectall}5');
									});

									// Reselect
									reSelectBlock();
									setInnerBlock('elements/link');

									// Assert control
									cy.openRepeaterItem(
										'Filters',
										'Drop Shadow'
									);
									cy.get('@filter-popover').within(() => {
										cy.getByDataTest(
											'filter-drop-shadow-x-input'
										).should('have.value', 5);

										cy.getByDataTest(
											'filter-drop-shadow-y-input'
										).should('have.value', 15);

										cy.getByDataTest(
											'filter-drop-shadow-blur-input'
										).should('have.value', 30);
									});
								});

								context(
									'Mobile → Focus → update drp-shadow-y = 35',
									() => {
										beforeEach(() => {
											setBlockState('Focus');
											//
											checkBlockCard([
												{
													label: 'Hover',
													type: 'State',
												},
												{
													label: 'Link',
													type: 'Inner Block',
												},
												{
													label: 'Focus',
													type: 'State',
												},
											]);

											// mobile/normal updates should display
											cy.openRepeaterItem(
												'Filters',
												'Drop Shadow'
											);
											cy.get('@filter-popover').within(
												() => {
													cy.getByDataTest(
														'filter-drop-shadow-x-input'
													).should('have.value', 5);

													cy.getByDataTest(
														'filter-drop-shadow-y-input'
													).should('have.value', 15);

													cy.getByDataTest(
														'filter-drop-shadow-blur-input'
													).should('have.value', 30);

													// Update y
													cy.getByDataTest(
														'filter-drop-shadow-y-input'
													).type('{selectall}35');
												}
											);

											// Reselect
											reSelectBlock();
											setInnerBlock('elements/link');

											// Assert control
											cy.openRepeaterItem(
												'Filters',
												'Drop Shadow'
											);
											cy.get('@filter-popover').within(
												() => {
													cy.getByDataTest(
														'filter-drop-shadow-x-input'
													).should('have.value', 5);

													cy.getByDataTest(
														'filter-drop-shadow-y-input'
													).should('have.value', 35);

													cy.getByDataTest(
														'filter-drop-shadow-blur-input'
													).should('have.value', 30);
												}
											);
										});

										it('should control value and styles be correct, when navigate between states and devices', () => {});
									}
								);
							}
						);
					});
				});
			});
		});
	});
});
