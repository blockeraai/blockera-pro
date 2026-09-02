# `@blockera/blocks-pro-core`

Pro **block extensions** paired with free GP `@blockera/blocks-core`. Extra inner-block / state coverage for WordPress core and third-party (Blocksy) blocks.

This package currently ships **Cypress specs** and Composer metadata. There is no `js/index.js` boot — editor unlocks for blocks still go through `@blockera/editor-pro` config and free block models. Do not invent a second block runtime here.

---

## Why it exists

Free `blocks-core` owns block models. Pro needs additional e2e (and, when PHP lands, Pro-only block PHP) without forking those models into this repo.

---

## Package layout

```text
packages/blocks-pro/core/
├── js/
│   ├── wordpress/          # Core block e2e (group, list, search, buttons, …)
│   └── third-party/        # Blocksy blocks e2e
├── package.json            # @blockera/blocks-pro-core
└── composer.json           # blockera/blocks-pro-core
```

Composer PSR-4 `Blockera\Blocks\Core\` → `php/` and `php/functions.php` are declared; **those files are not in the tree yet**. Do not import PHP from this namespace until they exist.

| Side | Package name | Entry |
|------|----------------|-------|
| JS | `@blockera/blocks-pro-core` | tests under `js/` (no runtime `main` implementation) |
| PHP | `blockera/blocks-pro-core` | reserved autoload |

---

## JS API

No public runtime exports. Specs live next to the block:

- `js/wordpress/<block>/test/*.e2e.cy.js`
- `js/third-party/<block>/…`

When you add Pro-only block **runtime** (filters on `blocks.registerBlockType`, inner-block model overlays), put a real `js/index.js`, export from `package.json` `main`, and wire it from `@blockera/blockera-pro` after the same unlock entry as `editor-pro`. Prefer `addFilter` on names free `blocks-core` already exposes.

---

## PHP API

None until `php/` is added. Planned autoload:

- Namespace `Blockera\Blocks\Core\`
- File `php/functions.php`

Keep JS ↔ PHP contracts in sync with free `blocks-core` if both sides exist.

---

## Rules for consumers

1. Pair every Pro block change with the free `packages/blocks-core` model (in the **blockera** plugin / GP). Ask before editing free (`product-scope`).
2. Do not copy free block JS into this folder.
3. New block e2e: same folder conventions as free `blocks-core` tests.
4. Inner blocks / extra states: GP `inner-blocks-and-block-states.md` + `editor-pro` `applyDefaultBlockStates`.

---

## Tests

From **blockera-pro** repo root:

```bash
npm run test:e2e -- --spec packages/blocks-pro/core/js/wordpress/group/test/heading-inner-block.blocks.e2e.cy.js
```

Covered areas (non-exhaustive): accordion-item, details, group, list/list-item, page-list, search, button/buttons; Blocksy about-me, contact-info, search, share-box, socials.

---

## Real consumers

| Consumer | Usage |
|----------|--------|
| Pro CI / local e2e | Specs in this package |
| `@blockera/editor-pro` | Extension overlays that affect these blocks |
| Free `@blockera/blocks-core` | Models under test |

---

## Quick checklist for AI agents

- [ ] Runtime overlay? `editor-pro` / free block model first; this package for Pro-only block code or e2e.
- [ ] New spec next to the block folder; use product `npm run test:e2e`.
- [ ] If you add `php/`, update this README’s PHP API section in the same change.
