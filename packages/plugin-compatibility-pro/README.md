# `@blockera/plugin-compatibility-pro`

Pro overlay on free `@blockera/plugin-compatibility`. Enqueues a small admin script on the compatibility screen so version mismatch can offer a **direct update** when Pro is allowed to.

Not a general compatibility library. Free owns `CompatibilityCheck`.

---

## Why it exists

When free and Pro plugin versions diverge, the free compatibility UI can offer an update URL. Pro must decide whether that **direct update** is allowed (`blockera.compatibility.directUpdateRequiredPlugin`).

---

## Package layout

```text
packages/plugin-compatibility-pro/
├── js/index.js          # addFilter on directUpdateRequiredPlugin
├── js/tests/            # Cypress
├── php/hooks.php        # Enqueue + ignored notices
├── package.json         # @blockera/plugin-compatibility-pro
└── composer.json        # blockera/plugin-compatibility-pro
```

| Side | Package name | Entry |
|------|----------------|-------|
| JS | `@blockera/plugin-compatibility-pro` | `js/index.js` |
| PHP | `blockera/plugin-compatibility-pro` | `php/hooks.php` (loaded from `blockera-pro.php`) |

PSR-4 `Blockera\PluginCompatibilityPro\` is declared but unused; do not add classes there unless the autoload is actually needed.

---

## JS API

Side-effect only (no exports).

```js
addFilter(
	'blockera.compatibility.directUpdateRequiredPlugin',
	'blockera.compatibilityPro.directUpdateRequiredPlugin',
	(pluginExists, updateUrl) => boolean
);
```

- `pluginExists === 0` → `false`
- Otherwise runs the same Pro unlock entry as other packages, then returns `updateUrl.length > 0`

Do not add a second compatibility boot. Extend this filter or the free package.

---

## PHP API

Loaded via `blockera_load('vendor.blockera.plugin-compatibility-pro.php.hooks', …)`.

| Hook | Effect |
|------|--------|
| `blockera/compatibility/admin-menus` | Enqueues `dist/plugin-compatibility-pro/plugin-compatibility-pro(.min).js` and inlines `blockeraAccount` from `blockera_pro_core_config('account')` |
| `blockera/notice/ignored_notices` | Ignores `blockera-pro-next-version-available` on `admin.php?page=blockera-compat` |

Asset path is the Pro plugin `dist/` folder. If the asset PHP file is missing, enqueue is skipped.

---

## Rules for consumers

1. Version compare logic stays in free `plugin-compatibility`.
2. Do not enqueue this script from other admin pages.
3. Keep the JS filter’s unlock entry aligned with other Pro packages (copy from `editor-pro` `register.js`; do not invent a shorter check).

---

## Tests

| File | Kind |
|------|------|
| `js/tests/blockera-pro-check.plugin-compatibility*.e2e.cy.js` | Cypress — free/Pro version mismatch and update CTA |

From repo root: `npm run test:e2e -- --spec <spec>`.

---

## Real consumers

| Consumer | Usage |
|----------|--------|
| `blockera-pro.php` | Loads `php/hooks.php` |
| Free compatibility admin | Filter host + menu action |

---

## Quick checklist for AI agents

- [ ] Compatibility rules: free package. Pro: enqueue + `directUpdateRequiredPlugin`.
- [ ] Dist handle must match `plugin-compatibility-pro` build output.
- [ ] Ask before changing free `plugin-compatibility` APIs.
