# `@blockera/editor-pro`

Pro **editor overlays**: extension config merge, extra block states, canvas / global styles, shared extension cache.

Free owns implementations in GP `@blockera/editor`. This package **does not fork** those libs. It `addFilter`s names free already exposes, after the same overlay gate as `registerEditorExtensions`.

---

## Why it exists

Paid editor behavior (extra states, `onNative: false` supports, canvas breakpoint types) must stay out of GP. Pro merges `./extensions/config` onto `blockera.block.{blockName}.extension.{supportId}` and fills empty canvas breakpoint types. Item caps and promo slots are read from the products store in GP.

---

## Package layout

```text
packages/editor-pro/
├── js/
│   ├── index.js                 # Re-exports extensions + canvas-editor
│   ├── extensions/
│   │   ├── register.js          # registerEditorExtensions, applyExtensions
│   │   ├── config/              # Per-support overlay objects
│   │   └── libs/                # block-states, shared cache; search-replace e2e
│   └── canvas-editor/           # bootstrapCanvasEditor, global-styles
├── php/StyleDefinitions/BaseProStyleDefinition.php
├── package.json                 # @blockera/editor-pro
└── composer.json                # blockera/editor-pro
```

| Side | Package name | Entry |
|------|----------------|-------|
| JS | `@blockera/editor-pro` | `js/index.js` |
| PHP | `blockera/editor-pro` | PSR-4 `Blockera\SiteBuilder\` |

---

## JS API

```js
import {
	registerEditorExtensions,
	applyExtensions,
	applyDefaultBlockStates,
	applyBlockStates,
	clearCache,
	bootstrapCanvasEditor,
	unlockGlobalStyles,
	config,
} from '@blockera/editor-pro';
```

Called from `@blockera/blockera-pro` (`js/index.js`). Do not add a parallel boot.

### `registerEditorExtensions()`

When overlays may run:

- `blockera.extensions.innerBlocks.config` — merge Pro support maps
- `blocks.registerBlockType` — for each export in `js/extensions/config`, `addFilter('blockera.block.{blockName}.extension.{supportId}', …)` via `mergeObject`. Sets `onNativeOnInnerBlocks` to `false` when missing or `true`.

**Config exports** (`js/extensions/config/index.js`): `typographyConfig`, `backgroundConfig`, `borderAndShadowConfig`, `effectsConfig`, `spacingConfig`, `positionConfig`, `sizeConfig`, `layoutConfig`, `customStyleConfig`, `flexChildConfig`, `mouseConfig`, `entranceAnimationConfig`, `scrollAnimationConfig`, `clickAnimationConfig`, `conditionsConfig`, `advancedSettingsConfig`, `iconConfig`, `statesConfig`.

Add a new support overlay here **and** keep the free lib as source of truth. Spacing is an overlay (`config/spacing.js`), not a GP style package. Icon gates controls (`config/icon.js`); implementation also lives in GP `@blockera/feature-icon`.

### `applyExtensions()`

`clearCache()` then `applyBlockStates()`.

### `applyBlockStates()` / `applyDefaultBlockStates()` / `unlockGlobalStyles()`

Licensed no-ops kept so existing boot / import names stay valid. Native and promo locks are lifted in GP from `blockera-pro` product `meta.license`.

### `clearCache()` (`libs/shared/actions.js`)

When overlays may run, `addAction('blockera.editor.extensions.sharedExtension.blockSupports.cacheData', …)` — writes extension config JSON through `@blockera/storage`.

### `bootstrapCanvasEditor()`

When overlays may run:

| Filter | Effect |
|--------|--------|
| `blockera.editor.canvasEditor.bootstrap.breakpoints` | Empty `type` is filled with the breakpoint key |

New canvas overlays: `addFilter` the free names. Do not import Pro from GP.

---

## PHP API

`Blockera\SiteBuilder\StyleDefinitions\BaseProStyleDefinition` — extends GP `BaseStyleDefinition`, implements `HasIgnoreChecks`, `isIgnoreChecks(): true`.

Use this base for Pro-only style definitions that must skip free ignore checks. Do not copy free `StyleDefinitions` into this package.

---

## Rules for consumers

1. Free first, then `applyFilters` in GP; Pro `addFilter` here.
2. New unlocks use the same overlay gate as `registerEditorExtensions` (`isAccountLicenseValid()`).
3. Do not `import` this package from GP.
4. Inner blocks / states: Pro support overlays set `onNativeOnInnerBlocks: false` (see GP `inner-blocks-and-block-states.md`).

---

## Tests

Cypress next to libs (`js/extensions/libs/**/test/`, `js/canvas-editor/test/`, `js/style-engine/test/`, `js/components/…`). From repo root: `npm run test:e2e -- --spec <spec>`.

---

## Real consumers

| Consumer | Usage |
|----------|--------|
| `@blockera/blockera-pro` | Boot |
| GP `@blockera/editor` | Filter host |
| `@blockera/controls-pro` | Additive control overlays (separate package) |

---

## Quick checklist for AI agents

- [ ] Search existing `blockera.*` filters before adding a name.
- [ ] Overlay in `extensions/config`, merge via `registerEditorExtensions` — do not fork the free lib.
- [ ] Canvas / GS: `canvas-editor/`, not a new package.
- [ ] PHP style defs extend `BaseProStyleDefinition` when ignore-checks must be skipped.
- [ ] Classify CROSS-REPOSITORY; ask before editing free `blockera`.
