# `@blockera/controls-pro`

Pro **control overlays** for GP `@blockera/controls`. Unlocks paid control options (promo slots, extra libraries, repeater header gating) via `addFilter`.

Not a second control library. Do not reimplement controls here.

---

## Why it exists

Some control behavior is limited in free (`PromoComponent`, gated libraries, repeater headers). Pro applies hooks from `applyControls()` after the same unlock entry as `editor-pro` `registerEditorExtensions`.

---

## Package layout

```text
packages/controls-pro/
└── js/
    ├── index.js                      # applyControls
    ├── background-control/apply.js
    ├── text-shadow-control/apply.js
    ├── box-shadow-control/apply.js
    ├── transform-control/apply.js
    ├── transition-control/apply.js
    ├── filter-control/apply.js
    ├── icon-control/apply.js
    └── repeater-control/apply.js
```

| Side | Package name | Entry |
|------|----------------|-------|
| JS | `@blockera/controls-pro` | `js/index.js` |

No Composer package. PHP control rendering stays in GP.

---

## JS API

```js
import { applyControls } from '@blockera/controls-pro';
```

Called from `@blockera/blockera-pro`. `applyControls()` runs the Pro unlock entry, then:

| Helper | Filter | Effect |
|--------|--------|--------|
| `applyBackgroundControlHooks` | `blockera.controls.background.meshGradientColors.OnChange` | Repeater item color updates |
| | `blockera.controls.background.props` | `PromoComponent: null` |
| `applyTextShadowControlHooks` | `blockera.controls.text-shadow.props` | `PromoComponent: null` |
| `applyBoxShadowControlHooks` | `blockera.controls.box-shadow.props` | `PromoComponent: null` |
| `applyTransformControlHooks` | `blockera.controls.transform.props` | `PromoComponent: null` |
| `applyTransitionControlHooks` | `blockera.controls.transition.props` | `PromoComponent: null` |
| `applyFilterControlHooks` | `blockera.controls.filter.props`, `blockera.controls.backdrop-filter.props` | `PromoComponent: null` |
| `applyIconControlHooks` | `blockera.controls.iconControl.utils.getLibraryIcons.type` | `'none'` (do not force a free-only library type) |
| `applyRepeaterControlHooks` | `blockera.repeater.shouldGateRepeaterItemHeaderForPromo` | `true` (Pro header behavior) |

Helpers are **not** part of the documented import surface. Add a new control overlay as `js/<control>/apply.js` and call it from `applyControls()` after the unlock entry.

---

## Rules for consumers

1. Paid **options** that are not extension config belong here; extension `onNative` / supports belong in `editor-pro` config.
2. Keep the free control file as source of truth. Filter the names it already `applyFilters`.
3. Do not import this package from GP.
4. Do not add license logic inside individual `apply.js` files — keep it in `applyControls()` only.

---

## Tests

Control e2e often lives next to free controls or `editor-pro` libs. Package-level Cypress is not required for every hook. From repo root: `npm run test:e2e`, `npm run test:js`.

---

## Real consumers

| Consumer | Usage |
|----------|--------|
| `@blockera/blockera-pro` | `applyControls()` |
| GP `@blockera/controls` | Filter host |

---

## Quick checklist for AI agents

- [ ] New paid control option: free `applyFilters` first, then a `apply*Hooks` here.
- [ ] Extension-level unlock (whole support): `editor-pro` config, not this package.
- [ ] Call new hooks from `applyControls()` only after the existing unlock entry.
