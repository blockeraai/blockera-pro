# `@blockera/controls-pro`

Pro **control overlays** for GP `@blockera/controls`. Adds paid control options (mesh gradient color `OnChange`, extra transition lists) via `addFilter`.

Not a second control library. Do not reimplement controls here. Promo slots and item caps are read from the products store in GP.

---

## Why it exists

Some control **behavior** is extra in Pro (mesh color updates, fuller transition option lists). Pro applies hooks from `applyControls()` after the same overlay gate as `editor-pro` `registerEditorExtensions`.

---

## Package layout

```text
packages/controls-pro/
└── js/
    ├── index.js                      # applyControls
    ├── background-control/apply.js
    └── transition-control/           # apply.js + extra option lists
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

Called from `@blockera/blockera-pro`. `applyControls()` runs when overlays may run, then:

| Helper | Filter | Effect |
|--------|--------|--------|
| `applyBackgroundControlHooks` | `blockera.controls.background.meshGradientColors.OnChange` | Repeater item color updates |
| `applyTransitionControlHooks` | `blockera.controls.transition.props` | Extra type and timing option lists |

Helpers are **not** part of the documented import surface. Add a new **additive** control overlay as `js/<control>/apply.js` and call it from `applyControls()`. Do not add filters whose only job is `PromoComponent: null` or item-cap lifts.

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
- [ ] Call new hooks from `applyControls()` only after the existing overlay gate.
