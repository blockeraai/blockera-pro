import {
	addBlockToPost,
	createPost,
	addBlockState,
	setDeviceType,
} from '@blockera/dev-cypress/js/helpers';

describe('Repeater Control label testing on Pro version (Image & Gradient)', () => {
	beforeEach(() => {
		createPost();

		addBlockToPost('core/paragraph', true, 'blockera-paragraph');
	});

	const openBackgroundItem = (index = 0) => {
		cy.getParentContainer('Image & Gradient').within(() => {
			cy.getByDataCy('group-control-header').eq(index).click();
		});
	};

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

		// Set value on hover by changing the inherited item (not adding a second one)
		openBackgroundItem();
		cy.getByAriaLabel('Linear Gradient').click();

		// Assert label after set value
		cy.checkLabelClassName(
			'Background',
			'Image & Gradient',
			'changed-in-secondary-state'
		);

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

		// Assert state graph
		cy.checkStateGraph('Background', 'Image & Gradient', {
			desktop: ['Normal', 'Hover'],
		});
	});
});
