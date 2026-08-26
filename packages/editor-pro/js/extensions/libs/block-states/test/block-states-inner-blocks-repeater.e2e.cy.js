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
	openSettingsPanel,
} from '@blockera/dev-cypress/js/helpers';

describe('Inner Blocks Repeater E2E Test', () => {
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

	const normalizeBoxShadow = (value) =>
		value
			.replace(/\s+/g, ' ')
			.replace(
				/rgba?\(\s*(\d+)\s*(?:,|\s)\s*(\d+)\s*(?:,|\s)\s*(\d+)\s*(?:,\s*|\s*\/\s*)([\d.]+)\s*\)/gi,
				(_, r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`
			)
			.trim();

	const assertBoxShadowCss = (getSubject, expected) => {
		getSubject().should(($el) => {
			expect(normalizeBoxShadow($el.css('box-shadow'))).to.equal(
				normalizeBoxShadow(expected)
			);
		});
	};

	const getInnerBlockLinkSelector = (data) =>
		`#block-${getBlockClientId(data)} a`;

	// Editor canvas: active styles are previewed via injected fallback selectors
	// while the Active block state is selected — :active cannot be simulated on
	// inner links inside the editor iframe.
	const assertEditorInnerBlockBoxShadow = (expected) => {
		getWPDataObject().then((data) => {
			assertBoxShadowCss(
				() => cy.getIframeBody().find(getInnerBlockLinkSelector(data)),
				expected
			);
		});
	};

	const assertFrontendActiveBoxShadow = (expected) => {
		cy.get('.my-link').realMouseDown();
		assertBoxShadowCss(() => cy.get('.my-link'), expected);
		cy.get('.my-link').realMouseUp();
	};

	const dismissGroupPopover = () => {
		cy.get('body').type('{esc}', { force: true });
	};

	const INNER_BLOCK_CONTROL_ADD_LABELS = {
		'Box Shadows': 'Add New Box Shadow',
		Filters: 'Add New Filter Effect',
	};

	const getControlContainerAlias = (label) =>
		label === 'Box Shadows' ? '@box-shadow-container' : '@filter-container';

	const getRepeaterRootSelector = (label) =>
		label === 'Box Shadows'
			? '.blockera-control-box-shadow[data-cy=blockera-repeater-control]'
			: '.blockera-control-filter[data-cy=blockera-repeater-control]';

	const pickNearestToInnerBlockCard = ($elements, $card) => {
		const cardRect = $card[0].getBoundingClientRect();
		let $best = Cypress.$();
		let bestDistance = Infinity;

		$elements.each((_, el) => {
			const rect = el.getBoundingClientRect();

			if (rect.height <= 0 || rect.width <= 0) {
				return;
			}

			const distance =
				Math.abs(rect.top - cardRect.bottom) +
				Math.abs(rect.left - cardRect.left);

			if (distance < bestDistance) {
				bestDistance = distance;
				$best = Cypress.$(el);
			}
		});

		return $best;
	};

	const resolveInnerBlockControlContainer = (label) => {
		const addLabel = INNER_BLOCK_CONTROL_ADD_LABELS[label];

		cy.getByDataTest('blockera-inner-block-card', {
			timeout: 20000,
		}).should('exist');

		return cy
			.getByAriaLabel(addLabel, { timeout: 20000 })
			.then(($buttons) => {
				return cy
					.getByDataTest('blockera-inner-block-card')
					.then(($card) => {
						const $button = pickNearestToInnerBlockCard(
							$buttons,
							$card
						);

						expect(
							$button.length,
							`"${addLabel}" for inner block`
						).to.be.greaterThan(0);

						return cy.wrap(
							$button.closest('[data-cy=base-control]')
						);
					});
			});
	};

	const getRepeaterListRows = ($container, label) => {
		return $container
			.find(
				`${getRepeaterRootSelector(label)} > [data-cy="repeater-item"]`
			)
			.filter(':visible')
			.not('[data-test="repeater-item-creating-step"]');
	};

	const scrollControlIntoView = (label, panelName = null) => {
		if (panelName) {
			openSettingsPanel(panelName);
		}

		resolveInnerBlockControlContainer(label).then(($container) => {
			$container[0].scrollIntoView({
				block: 'center',
				inline: 'nearest',
				behavior: 'auto',
			});
		});

		resolveInnerBlockControlContainer(label)
			.scrollIntoView({ offset: { top: -300 }, duration: 0 })
			.should('be.visible');
	};

	const prepareInnerBlockLink = () => {
		reSelectBlock();
		setInnerBlock('elements/link');
	};

	const prepareBoxShadowControls = () => {
		prepareInnerBlockLink();
		dismissGroupPopover();
		scrollControlIntoView('Box Shadows', 'Border And Shadow');
		resolveInnerBlockControlContainer('Box Shadows').as(
			'box-shadow-container'
		);
	};

	const openBoxShadowRepeaterItem = (contains) => {
		dismissGroupPopover();
		openSettingsPanel('Border And Shadow');
		cy.get('@box-shadow-container').then(($container) => {
			const $header = getRepeaterListRows($container, 'Box Shadows')
				.find('[data-cy="group-control-header"]')
				.filter((_, el) => el.textContent.includes(contains))
				.first();

			expect($header.length).to.be.greaterThan(0);
			cy.wrap($header).click({ force: true });
		});
	};

	const assertVisibleRepeaterCount = (label, count, panelName = null) => {
		dismissGroupPopover();
		if (panelName) {
			openSettingsPanel(panelName);
		}

		cy.get(getControlContainerAlias(label)).should(($container) => {
			expect(getRepeaterListRows($container, label)).to.have.length(
				count
			);
		});
	};

	const assertVisibleRepeaterIncludesText = (
		label,
		text,
		panelName = null
	) => {
		dismissGroupPopover();
		if (panelName) {
			openSettingsPanel(panelName);
		}

		cy.get(getControlContainerAlias(label)).should(($container) => {
			const $rows = getRepeaterListRows($container, label);
			expect($rows.length).to.be.greaterThan(0);
			expect($rows.text()).to.include(text);
		});
	};

	const withinBoxShadowPopover = (fn) => {
		cy.getByDataTest('popover-body').last().within(fn);
	};

	it('should control value and attributes be correct, when navigate between states and devices', () => {
		initialSetting();
		setInnerBlock('elements/link');

		// Alias
		prepareBoxShadowControls();

		// add box shadow
		cy.get('@box-shadow-container').within(() => {
			cy.getByAriaLabel('Add New Box Shadow').click({ force: true });
		});

		// alias
		withinBoxShadowPopover(() => {
			cy.getByDataTest('box-shadow-blur-input').type(`{selectall}20`, {
				force: true,
			});
		});

		// Reselect
		prepareBoxShadowControls();

		// Assert control value
		assertVisibleRepeaterCount('Box Shadows', 1, 'Border And Shadow');
		assertVisibleRepeaterIncludesText(
			'Box Shadows',
			'20',
			'Border And Shadow'
		);

		addBlockState('hover');
		prepareBoxShadowControls();

		assertVisibleRepeaterCount('Box Shadows', 1, 'Border And Shadow');

		// set x
		openBoxShadowRepeaterItem('Outer');

		withinBoxShadowPopover(() => {
			// normal state updates should display
			cy.getByDataTest('box-shadow-blur-input').should(
				'have.value',
				'20'
			);

			cy.getByDataTest('box-shadow-x-input').type(`{selectall}5`);
		});

		// Reselect
		prepareBoxShadowControls();

		// Assert control value
		openBoxShadowRepeaterItem('Outer');
		withinBoxShadowPopover(() => {
			cy.getByDataTest('box-shadow-x-input').should('have.value', '5');
		});

		addBlockState('active');
		prepareBoxShadowControls();

		assertVisibleRepeaterCount('Box Shadows', 1, 'Border And Shadow');

		// hover state updates should not display
		openBoxShadowRepeaterItem('Outer');
		withinBoxShadowPopover(() => {
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
		cy.get('@box-shadow-container').within(() => {
			cy.getByAriaLabel('Add New Box Shadow').click({ force: true });
		});
		withinBoxShadowPopover(() => {
			cy.getByAriaLabel('Inner').click();
		});

		// Reselect
		checkCurrentState('active');
		prepareBoxShadowControls();
		assertVisibleRepeaterCount('Box Shadows', 2, 'Border And Shadow');

		openBoxShadowRepeaterItem('Inner');
		withinBoxShadowPopover(() => {
			cy.getByAriaLabel('Inner').should(
				'have.attr',
				'aria-checked',
				'true'
			);
		});

		setDeviceType('Tablet');
		checkCurrentState('active');
		prepareBoxShadowControls();

		// normal state updates should display
		assertVisibleRepeaterCount('Box Shadows', 2, 'Border And Shadow');
		assertVisibleRepeaterIncludesText(
			'Box Shadows',
			'Outer',
			'Border And Shadow'
		);
		assertVisibleRepeaterIncludesText(
			'Box Shadows',
			'Inner',
			'Border And Shadow'
		);

		openBoxShadowRepeaterItem('Outer');
		withinBoxShadowPopover(() => {
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
		checkCurrentState('active');
		prepareBoxShadowControls();

		openBoxShadowRepeaterItem('Outer');
		withinBoxShadowPopover(() => {
			cy.getByDataTest('box-shadow-blur-input').should(
				'have.value',
				'20'
			);

			cy.getByDataTest('box-shadow-x-input').should('have.value', '10');

			cy.getByDataTest('box-shadow-y-input').should('have.value', '50');
		});

		setBlockState('Normal');
		prepareBoxShadowControls();

		// should display only laptop / normal value
		assertVisibleRepeaterCount('Box Shadows', 1, 'Border And Shadow');
		assertVisibleRepeaterIncludesText(
			'Box Shadows',
			'Outer',
			'Border And Shadow'
		);
		openBoxShadowRepeaterItem('Outer');
		withinBoxShadowPopover(() => {
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
		assertEditorInnerBlockBoxShadow(
			'rgba(0, 0, 0, 0.67) 10px 10px 30px 40px'
		);

		setBlockState('Active');
		checkCurrentState('active');
		prepareBoxShadowControls();

		// Assert block css (active/tablet)
		assertEditorInnerBlockBoxShadow(
			'rgba(0, 0, 0, 0.67) 10px 50px 20px 0px, rgba(0, 0, 0, 0.67) 10px 10px 10px 0px inset'
		);

		// Change to laptop device (active/desktop)
		setDeviceType('Desktop');
		prepareBoxShadowControls();

		// Assert control value
		assertVisibleRepeaterCount('Box Shadows', 2, 'Border And Shadow');

		openBoxShadowRepeaterItem('Outer');
		withinBoxShadowPopover(() => {
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

		openBoxShadowRepeaterItem('Inner');
		withinBoxShadowPopover(() => {
			// default value
			cy.getByDataTest('box-shadow-x-input').should('have.value', '10');

			cy.getByDataTest('box-shadow-y-input').should('have.value', '10');

			cy.getByDataTest('box-shadow-blur-input').should(
				'have.value',
				'10'
			);

			cy.getByDataTest('box-shadow-spread-input').should(
				'have.value',
				'0'
			);
		});

		// Assert block css (active/desktop)
		assertEditorInnerBlockBoxShadow(
			'rgba(0, 0, 0, 0.67) 10px 10px 20px 0px, rgba(0, 0, 0, 0.67) 10px 10px 10px 0px inset'
		);

		// Change to normal state (normal/laptop)
		setBlockState('Normal');
		prepareBoxShadowControls();

		// Assert control value
		assertVisibleRepeaterCount('Box Shadows', 1, 'Border And Shadow');

		openBoxShadowRepeaterItem('Outer');
		withinBoxShadowPopover(() => {
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
			assertBoxShadowCss(
				() =>
					cy
						.getIframeBody()
						.find(`#block-${getBlockClientId(data)} a`),
				'rgba(0, 0, 0, 0.67) 10px 10px 20px 0px'
			);

			// Real hover
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.realHover();
			assertBoxShadowCss(
				() =>
					cy
						.getIframeBody()
						.find(`#block-${getBlockClientId(data)} a`),
				'rgba(0, 0, 0, 0.67) 5px 10px 20px 0px'
			);
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.realMouseUp();
		});

		// Change to hover state (hover/laptop)
		setBlockState('Hover');
		prepareBoxShadowControls();

		// Assert control
		assertVisibleRepeaterCount('Box Shadows', 1, 'Border And Shadow');
		openBoxShadowRepeaterItem('Outer');
		withinBoxShadowPopover(() => {
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
			assertBoxShadowCss(
				() =>
					cy
						.getIframeBody()
						.find(`#block-${getBlockClientId(data)} a`),
				'rgba(0, 0, 0, 0.67) 5px 10px 20px 0px'
			);

			// Real hover
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
				.realHover();
			assertBoxShadowCss(
				() =>
					cy
						.getIframeBody()
						.find(`#block-${getBlockClientId(data)} a`),
				'rgba(0, 0, 0, 0.67) 5px 10px 20px 0px'
			);
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)} a`)
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
		assertBoxShadowCss(
			() => cy.get('.my-link'),
			'rgba(0, 0, 0, 0.67) 10px 10px 20px 0px'
		);

		// Hover
		cy.get('.my-link').realHover();
		assertBoxShadowCss(
			() => cy.get('.my-link'),
			'rgba(0, 0, 0, 0.67) 5px 10px 20px 0px'
		);
		cy.get('.my-link').realMouseUp();

		// Active
		assertFrontendActiveBoxShadow(
			'rgba(0, 0, 0, 0.67) 10px 10px 20px 0px, rgba(0, 0, 0, 0.67) 10px 10px 10px 0px inset'
		);

		// Set desktop viewport
		cy.viewport(1441, 1920);
		assertBoxShadowCss(
			() => cy.get('.my-link'),
			'rgba(0, 0, 0, 0.67) 10px 10px 20px 0px'
		);

		// Active
		assertFrontendActiveBoxShadow(
			'rgba(0, 0, 0, 0.67) 10px 10px 20px 0px, rgba(0, 0, 0, 0.67) 10px 10px 10px 0px inset'
		);

		// Hover
		cy.get('.my-link').realHover();
		assertBoxShadowCss(
			() => cy.get('.my-link'),
			'rgba(0, 0, 0, 0.67) 5px 10px 20px 0px'
		);
		cy.get('.my-link').realMouseUp();

		// Set tablet viewport
		cy.viewport(768, 1024);

		// Normal (tablet breakpoint overrides)
		assertBoxShadowCss(
			() => cy.get('.my-link'),
			'rgba(0, 0, 0, 0.67) 10px 10px 30px 40px'
		);

		// Active
		assertFrontendActiveBoxShadow(
			'rgba(0, 0, 0, 0.67) 10px 50px 20px 0px, rgba(0, 0, 0, 0.67) 10px 10px 10px 0px inset'
		);

		// Hover
		cy.get('.my-link').realHover();
		assertBoxShadowCss(
			() => cy.get('.my-link'),
			'rgba(0, 0, 0, 0.67) 5px 10px 20px 0px'
		);
		cy.get('.my-link').realMouseUp();

		// Set mobile viewport — no mobile-specific normal override; desktop base applies
		cy.viewport(380, 470);

		assertBoxShadowCss(
			() => cy.get('.my-link'),
			'rgba(0, 0, 0, 0.67) 10px 10px 20px 0px'
		);

		// Hover
		cy.get('.my-link').realHover();
		assertBoxShadowCss(
			() => cy.get('.my-link'),
			'rgba(0, 0, 0, 0.67) 5px 10px 20px 0px'
		);
		cy.get('.my-link').realMouseUp();

		// Active (desktop/active — no mobile breakpoint override)
		assertFrontendActiveBoxShadow(
			'rgba(0, 0, 0, 0.67) 10px 10px 20px 0px, rgba(0, 0, 0, 0.67) 10px 10px 10px 0px inset'
		);
	});
});
