import {
	appendBlocks,
	createPost,
	getWPDataObject,
} from '@blockera/dev-cypress/js/helpers';

function openSearch() {
	cy.getByDataTest('blockera-search-replace-header-button', {
		timeout: 30000,
	}).click();
	cy.getByDataTest('blockera-search-replace-panel').should('be.visible');
}

function chooseScope(scope) {
	cy.getByDataTest('blockera-search-replace-scope')
		.find('select')
		.then(($select) => {
			const option = [...$select[0].options].find(
				(item) => item.value === scope
			);
			const locked = Boolean(option && /\(Pro\)/.test(option.text));

			if (locked) {
				cy.window().then((win) => {
					win.wp.data
						.dispatch('blockera/search-replace')
						.setScope(scope);
				});
				return;
			}

			cy.wrap($select).select(scope);
		});

	cy.getByDataTest('blockera-search-replace-scope')
		.find('select')
		.should('have.value', scope);
	cy.get('.blockera-component-upgrade-prompt').should('not.exist');
}

function enableRegex() {
	cy.getByDataTest('blockera-search-replace-use-regex').then(($button) => {
		if ($button.attr('aria-pressed') !== 'true') {
			cy.wrap($button).click();
		}
	});
	cy.getByDataTest('blockera-search-replace-use-regex').should(
		'have.attr',
		'aria-pressed',
		'true'
	);
}

describe('Search and replace → Pro scopes', () => {
	beforeEach(() => {
		createPost();
	});

	it('unlocks Attributes and All and can replace image alt', () => {
		appendBlocks(`<!-- wp:image {"alt":"find-alt","url":"https://example.com/p.png"} -->
<figure class="wp-block-image"><img alt="find-alt" src="https://example.com/p.png"/></figure>
<!-- /wp:image -->
<!-- wp:paragraph -->
<p>find-alt in text</p>
<!-- /wp:paragraph -->`);

		openSearch();
		chooseScope('attributes');

		cy.getByDataTest('blockera-search-replace-find-input')
			.clear()
			.type('find-alt', { delay: 0 });

		cy.getByDataTest('blockera-search-replace-results').should(
			'contain',
			'1 of 1'
		);

		cy.getByDataTest('blockera-search-replace-replace-input').type(
			'new-alt',
			{ delay: 0 }
		);
		cy.getByDataTest('blockera-search-replace-replace').click();

		getWPDataObject().then((data) => {
			const image = data
				.select('core/block-editor')
				.getBlocks()
				.find((block) => block.name === 'core/image');
			expect(image.attributes.alt).to.equal('new-alt');
		});

		chooseScope('all');
		cy.getByDataTest('blockera-search-replace-find-input')
			.clear()
			.type('find-alt', { delay: 0 });
		cy.getByDataTest('blockera-search-replace-results').should(
			'contain',
			'1 of 1'
		);
	});

	it('replaces an attribute match using a regular expression', () => {
		appendBlocks(`<!-- wp:image {"alt":"sku-42 leftover","url":"https://example.com/p.png"} -->
<figure class="wp-block-image"><img alt="sku-42 leftover" src="https://example.com/p.png"/></figure>
<!-- /wp:image -->`);

		openSearch();
		chooseScope('attributes');
		enableRegex();

		cy.getByDataTest('blockera-search-replace-find-input')
			.clear()
			.type('sku-(\\d+)', { delay: 0 });

		cy.getByDataTest('blockera-search-replace-results').should(
			'contain',
			'1 of 1'
		);

		cy.getByDataTest('blockera-search-replace-replace-input').type(
			'item-$1',
			{ delay: 0 }
		);
		cy.getByDataTest('blockera-search-replace-replace').click();

		cy.getByDataTest('blockera-search-replace-results').should(
			'contain',
			'No results'
		);

		getWPDataObject().then((data) => {
			const image = data
				.select('core/block-editor')
				.getBlocks()
				.find((block) => block.name === 'core/image');
			expect(image.attributes.alt).to.equal('item-42 leftover');
		});
	});
});
