import {
	savePage,
	getWPDataObject,
	getSelectedBlock,
	redirectToFrontPage,
	createPost,
} from '@blockera/dev-cypress/js/helpers';

describe('Outline → Functionality', () => {
	beforeEach(() => {
		createPost();

		cy.getBlock('default').type('This is test paragraph', { delay: 0 });
		cy.getByAriaControls('styles-view').click();

		cy.activateMoreSettingsItem('More Border Settings', 'Outline');

		cy.getParentContainer('Outline').as('container');
	});

	it('should update correctly, when add outline', () => {
		cy.get('@container').within(() => {
			cy.get('[aria-label="Add New Outline"]').click({
				force: true,
			});
		});

		// Fill fields in the auto-opened repeater popover (matches outline-control.cy.js).
		cy.getByDataTest('popover-body')
			.last()
			.within(() => {
				cy.getByDataTest('border-control-width').clear({ force: true });
				cy.getByDataTest('border-control-width').type(3, {
					force: true,
				});

				// CustomSelectControl (Ariakit) — dashed is option index 1 (solid=0).
				cy.getByDataTest('border-control-component')
					.find('[aria-haspopup="listbox"]')
					.click({ force: true });
			});

		cy.get('[role="listbox"]:visible')
			.find('[role="option"]')
			.eq(1)
			.click({ force: true });

		cy.getByDataTest('popover-body')
			.last()
			.within(() => {
				cy.getByDataTest('outline-offset-input').clear({ force: true });
				cy.getByDataTest('outline-offset-input').type(10, {
					force: true,
				});

				cy.getByDataTest('border-control-color').click({ force: true });
			});

		cy.getByDataTest('popover-body')
			.last()
			.within(() => {
				cy.get('[data-cy="color-picker-css-value"]').clear({
					force: true,
				});
				cy.get('[data-cy="color-picker-css-value"]').type('c5eef0ab', {
					delay: 0,
				});
			});

		// Check block
		cy.getBlock('core/paragraph').should(
			'have.css',
			'outline',
			'rgba(197, 238, 240, 0.67) dashed 3px'
		);

		cy.getBlock('core/paragraph').should(
			'have.css',
			'outline-offset',
			'10px'
		);

		// Check store
		getWPDataObject().then((data) => {
			expect({
				0: {
					isVisible: true,
					border: {
						width: '3px',
						color: '#c5eef0ab',
						style: 'dashed',
					},
					offset: '10px',
					order: 0,
				},
			}).to.be.deep.equal(getSelectedBlock(data, 'blockeraOutline'));
		});

		// Check frontend
		savePage();

		redirectToFrontPage();

		cy.get('.blockera-block').should(
			'have.css',
			'outline',
			'rgba(197, 238, 240, 0.67) dashed 3px'
		);

		cy.get('.blockera-block').should('have.css', 'outline-offset', '10px');
	});
});
