import {
	addBlockToPost,
	createPost,
	addBlockState,
	setDeviceType,
} from '../../../../../dev-cypress/js/helpers';

describe('Repeater Control label testing on Pro version (Image & Gradient)', () => {
	beforeEach(() => {
		createPost();

		addBlockToPost('core/paragraph', true, 'blockera-paragraph');
	});
	it('should display changed value on Image & Gradient, when set value in two states', () => {
		/**
		 * Normal
		 */
		// Set value
		cy.getByAriaLabel('Add New Background').click();

		// Assert label
		cy.checkLabelClassName(
			'Background',
			'Image & Gradient',
			'changed-in-normal-state'
		);

		/**
		 * Hover
		 */
		addBlockState('hover');

		// Assert label before set value
		cy.checkLabelClassName(
			'Background',
			'Image & Gradient',
			'changed-in-normal-state'
		);

		// Set value
		cy.getByAriaLabel('Add New Background').click();

		// Assert label after set value
		cy.checkLabelClassName(
			'Background',
			'Image & Gradient',
			'changed-in-secondary-state'
		);

		// Assert control
		cy.getParentContainer('Image & Gradient').within(() => {
			// Alias
			cy.getByDataCy('group-control-header').as('background-item');
		});
		cy.get('@background-item').should('have.length', 2);

		/**
		 * Tablet device
		 */
		setDeviceType('Tablet');

		// Assert label
		cy.checkLabelClassName(
			'Background',
			'Image & Gradient',
			'changed-in-normal-state'
		);

		// Assert control
		cy.get('@background-item').should('have.length', 1);

		// Assert state graph
		cy.checkStateGraph('Background', 'Image & Gradient', {
			laptop: ['Normal', 'Hover'],
		});
	});
});
