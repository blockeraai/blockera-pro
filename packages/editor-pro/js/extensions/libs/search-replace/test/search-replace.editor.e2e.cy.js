import {
	appendBlocks,
	closeWelcomeGuide,
	createPost,
	disableGutenbergFeatures,
	getScopedStorageKey,
	getWPDataObject,
} from '@blockera/dev-cypress/js/helpers';

const SCOPE_STORAGE_KEY = 'blockera-search-replace-scope';

function openSearch() {
	cy.getByDataTest('blockera-search-replace-header-button', {
		timeout: 30000,
	}).click();
	cy.getByDataTest('blockera-search-replace-panel').should('be.visible');
}

function expectScope(scope) {
	cy.getByDataTest('blockera-search-replace-scope')
		.find('select')
		.should('have.value', scope);
}

function rememberScope(scope) {
	cy.window().then((win) => {
		win.localStorage.setItem(
			getScopedStorageKey(win, SCOPE_STORAGE_KEY),
			scope
		);
	});
}

function expectRememberedScope(scope) {
	cy.window().then((win) => {
		expect(
			win.localStorage.getItem(
				getScopedStorageKey(win, SCOPE_STORAGE_KEY)
			)
		).to.equal(scope);

		if (
			win.wp.data.select('blockera/search-replace').getScope() !== scope
		) {
			win.wp.data.dispatch('blockera/search-replace').setScope(scope);
		}
	});
	expectScope(scope);
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
			} else {
				cy.wrap($select).select(scope);
			}
		});

	expectScope(scope);
	cy.get('.blockera-component-upgrade-prompt').should('not.exist');
	rememberScope(scope);
}

function reloadEditor() {
	cy.reload();
	closeWelcomeGuide();
	disableGutenbergFeatures();
	cy.getByDataTest('blockera-search-replace-header-button', {
		timeout: 30000,
	}).should('exist');
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
		openSearch();
		chooseScope('attributes');
		reloadEditor();

		appendBlocks(`<!-- wp:image {"alt":"find-alt","url":"https://example.com/p.png"} -->
<figure class="wp-block-image"><img alt="find-alt" src="https://example.com/p.png"/></figure>
<!-- /wp:image -->
<!-- wp:paragraph -->
<p>find-alt in text</p>
<!-- /wp:paragraph -->`);

		openSearch();
		expectRememberedScope('attributes');

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
		openSearch();
		chooseScope('attributes');
		reloadEditor();

		appendBlocks(`<!-- wp:image {"alt":"sku-42 leftover","url":"https://example.com/p.png"} -->
<figure class="wp-block-image"><img alt="sku-42 leftover" src="https://example.com/p.png"/></figure>
<!-- /wp:image -->`);

		openSearch();
		expectRememberedScope('attributes');
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
