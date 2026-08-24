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
	checkCurrentState,
	getWPDataObject,
	getSelectedBlock,
	getBlockClientId,
	redirectToFrontPage,
	openSettingsPanel,
	dismissOpenModals,
} from '@blockera/dev-cypress/js/helpers';

describe('Block State Repeater E2E Test - update repeater attributes in multiple states and devices', () => {
	const scrollBackgroundIntoView = () => {
		openSettingsPanel('Background');
		cy.getParentContainer('Image & Gradient').then(($container) => {
			$container[0].scrollIntoView({
				block: 'center',
				inline: 'nearest',
				behavior: 'auto',
			});
		});
	};

	const prepareBackgroundControls = () => {
		dismissOpenModals();
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
			cy.getByDataCy('group-control-header').then(($headers) => {
				const $target = $headers.filter(':visible').first();
				cy.wrap($target.length ? $target : $headers.first()).click({
					force: true,
				});
			});
		});
	};

	const withinVisibleBackgroundPopover = (fn) => {
		cy.getByDataTest('popover-body', { timeout: 20000 }).then(
			($popovers) => {
				const $visible = $popovers.filter(':visible');
				cy.wrap(
					$visible.length ? $visible.last() : $popovers.last()
				).within(fn);
			}
		);
	};

	const closeBackgroundPopover = () => {
		cy.get('body').then(($body) => {
			const $close = $body.find(
				'[data-test="popover-header"] [aria-label="Close"]'
			);
			const $target = $close.filter(':visible').last();

			if ($target.length) {
				cy.wrap($target).click({ force: true });
				return;
			}

			cy.get('body').type('{esc}', { force: true });
		});
	};

	const clickBackgroundOption = (ariaLabel) => {
		openBackgroundItem();
		withinVisibleBackgroundPopover(() => {
			cy.get(`button[aria-label="${ariaLabel}"]`)
				.last()
				.click({ force: true });
		});
		closeBackgroundPopover();
	};

	const assertCanvasBackgroundImage = (expected) => {
		getWPDataObject().then((data) => {
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)}`)
				.should('have.css', 'background-image', expected);
		});
	};

	const hoverFrontendBlock = () => {
		cy.get('.blockera-block').trigger('mouseover', { force: true });
		cy.get('.blockera-block').trigger('mouseenter', { force: true });
	};

	const prepare = () => {
		cy.viewport(1440, 1025);

		createPost();

		appendBlocks(
			`<!-- wp:paragraph -->
<p>Test</p>
<!-- /wp:paragraph -->`
		);
		cy.getBlock('core/paragraph').click({ force: true });
		cy.getByAriaControls('styles-view').click({ force: true });
		scrollBackgroundIntoView();

		cy.getParentContainer('Image & Gradient').within(() => {
			cy.getByAriaLabel('Add New Background').click({ force: true });
		});
		cy.getByAriaLabel('Linear Gradient').click({ force: true });

		prepareBackgroundControls();

		assertVisibleRepeaterCount('Image & Gradient', 1);
		cy.getParentContainer('Image & Gradient').within(() => {
			cy.contains('Linear Gradient').should('exist');
		});

		setBlockState('Hover');
		prepareBackgroundControls();
		clickBackgroundOption('Rotate Anti-clockwise');

		assertVisibleRepeaterCount('Image & Gradient', 1);
		cy.getParentContainer('Image & Gradient').within(() => {
			cy.contains('Linear Gradient').should('exist');
		});

		prepareBackgroundControls();
		openBackgroundItem();
		withinVisibleBackgroundPopover(() => {
			cy.getParentContainer('Angle').within(() => {
				cy.get('input[inputmode="numeric"]').should('have.value', '45');
			});
		});
		closeBackgroundPopover();

		addBlockState('focus');
		prepareBackgroundControls();
		openBackgroundItem();
		withinVisibleBackgroundPopover(() => {
			cy.get('button[aria-label="Repeat"]').click({
				force: true,
			});

			cy.getByAriaLabel('Linear Gradient').should(
				'have.attr',
				'aria-checked',
				'true'
			);

			cy.getParentContainer('Angle').within(() => {
				cy.get('input[inputmode="numeric"]').should('have.value', '90');
			});
		});
		closeBackgroundPopover();

		prepareBackgroundControls();
		openBackgroundItem();
		withinVisibleBackgroundPopover(() => {
			cy.getParentContainer('Angle').within(() => {
				cy.get('input[inputmode="numeric"]').should('have.value', '90');
			});

			cy.get('button[aria-label="Repeat"]').should(
				'have.attr',
				'aria-checked',
				'true'
			);
		});
		closeBackgroundPopover();

		setDeviceType('Mobile Portrait');
		prepareBackgroundControls();
		openBackgroundItem();
		withinVisibleBackgroundPopover(() => {
			cy.getByAriaLabel('Parallax').click({ force: true });

			cy.getByAriaLabel('Repeat').should(
				'not.have.attr',
				'aria-checked',
				'true'
			);

			cy.getParentContainer('Angle').within(() => {
				cy.get('input[inputmode="numeric"]').should('have.value', '90');
			});
		});
		closeBackgroundPopover();

		prepareBackgroundControls();
		openBackgroundItem();
		withinVisibleBackgroundPopover(() => {
			cy.getByAriaLabel('Parallax').should(
				'have.attr',
				'aria-checked',
				'true'
			);
		});
		closeBackgroundPopover();
	};

	it('should control value and attributes be correct, when navigate between states and devices', () => {
		prepare();

		// Focus / Mobile — styles apply while Focus state is active in the panel.
		getWPDataObject().then((data) => {
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)}`)
				.should('have.css', 'background-attachment', 'fixed');
		});

		setDeviceType('Desktop');
		setBlockState('Normal');
		checkCurrentState('normal');

		// Do not reselect before this assertion: clicking the paragraph applies
		// native :focus, so Focus-state CSS (repeating-linear-gradient) wins.
		assertCanvasBackgroundImage(
			'linear-gradient(90deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
		);

		prepareBackgroundControls();
		openBackgroundItem();
		withinVisibleBackgroundPopover(() => {
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
				cy.get('input[inputmode="numeric"]').should('have.value', '90');
			});
		});
		closeBackgroundPopover();

		setBlockState('Focus');
		checkCurrentState('focus');

		getWPDataObject().then((data) => {
			cy.getIframeBody()
				.find(`#block-${getBlockClientId(data)}`)
				.should(
					'have.css',
					'background-image',
					'repeating-linear-gradient(90deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
				)
				.and('have.css', 'background-repeat', 'repeat');
		});

		prepareBackgroundControls();
		openBackgroundItem();
		withinVisibleBackgroundPopover(() => {
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
		closeBackgroundPopover();

		setBlockState('Hover');
		checkCurrentState('hover');

		// Same as Normal: reselect would match :focus and hide Hover preview CSS.
		assertCanvasBackgroundImage(
			'linear-gradient(45deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
		);

		prepareBackgroundControls();
		openBackgroundItem();
		withinVisibleBackgroundPopover(() => {
			cy.getByAriaLabel("Don't Repeat").should(
				'have.attr',
				'aria-checked',
				'true'
			);

			cy.getParentContainer('Angle').within(() => {
				cy.get('input[inputmode="numeric"]').should('have.value', '45');
			});

			cy.getByAriaLabel('Parallax').should(
				'not.have.attr',
				'aria-checked',
				'true'
			);
		});
		closeBackgroundPopover();

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
			}).to.be.deep.equal(getSelectedBlock(data, 'blockeraBackground'));

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
										'linear-gradient-attachment': 'scroll',
										'linear-gradient-repeat': 'no-repeat',
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
										'linear-gradient-attachment': 'scroll',
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
										'linear-gradient-attachment': 'fixed',
										'linear-gradient-repeat': 'no-repeat',
										order: 0,
										type: 'linear-gradient',
									},
								},
							},
						},
					},
					isVisible: true,
				},
			}).to.be.deep.equal(getSelectedBlock(data, 'blockeraBlockStates'));
		});

		savePage();
		redirectToFrontPage();

		cy.viewport(1025, 1440);
		cy.get('.blockera-block').should(
			'have.css',
			'background-image',
			'linear-gradient(90deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
		);

		hoverFrontendBlock();
		cy.get('.blockera-block').should(
			'have.css',
			'background-image',
			'linear-gradient(45deg, rgb(0, 158, 250) 10%, rgb(229, 46, 0) 90%)'
		);
	});
});
