# `@blockera/blockera-pro-admin`

Pro **WordPress admin settings** overlay. Replaces the free admin assets provider, adds Account / Licenses UI, dashboard tabs, and Pro general-settings (breakpoints, block visibility).

Side-effect boot. Depends on free Blockera admin (`@blockera/blockera-admin`) being present.

---

## Why it exists

Free admin shows upgrade CTAs and limited settings. Pro must:

- Enqueue Pro admin assets on `blockera-settings` screens
- Swap the Account panel for `@blockera/auth-pro` (`ConnectWithBlockera`)
- Unlock breakpoint editing and restrict-visibility settings via `addFilter`

---

## Package layout

```text
packages/blockera-pro-admin/
├── js/
│   ├── index.js                 # Boot: blockera.bootstrapper.before.domReady
│   ├── panels/index.js          # Account panel filters
│   ├── panels/dashboard.js      # Dashboard tabs / profile / CTA
│   └── panels/general/          # General settings + breakpoints
├── php/
│   ├── hooks.php
│   └── Providers/BlockeraProAdminAssetsProvider.php
├── package.json                 # @blockera/blockera-pro-admin
└── composer.json                # blockera/blockera-pro-admin
```

| Side | Package name | Entry |
|------|----------------|-------|
| JS | `@blockera/blockera-pro-admin` | `js/index.js` |
| PHP | `blockera/blockera-pro-admin` | PSR-4 `Blockera\Pro\Admin\` |

---

## JS API

The package **does not export** a public React tree from `js/index.js`. It registers `addFilter('blockera.bootstrapper.before.domReady', 'blockera.pro.admin.bootstrap', initializeBlockeraProAdmin)`.

`initializeBlockeraProAdmin()` returns a function that first calls `syncProProductLicense()` (from `@blockera/blockera-pro/js/register-product-license.js`, not the editor boot entry), then:

| Function | Filter(s) | Effect |
|----------|-----------|--------|
| `filteredIgnoredPanelTabs` | `blockera.admin.panelHeader.ignoredTabs` | Adds `account` to ignored header tabs |
| `filterCallToActions` | `blockera.admin.dashboard.pro.call.to.actions` | Activate-license CTA when not connected |
| `filterAvailableTabs` | `blockera.admin.dashboard.tabs` | Adds **Account & Licenses** tab |
| `filteredDashboardAvailablePages` | `blockera.admin.dashboard.availablePages` | Adds `account` page |
| `filteredDashboardProfileComponent` | `blockera.admin.dashboard.profile.component` | Pro profile (`ProfileComponent`) |
| `proPanelTabs` | `blockera.admin.panels` | Registers `account` panel |
| `accountHasHeader` | `blockera.admin.panel.account.hasHeader` | `false` |
| `accountActivePanelComponent` | `blockera.admin.panel.account.activePanelComponent` | `<ConnectWithBlockera />` |
| `accountDescriptionComponent` | `blockera.admin.panel.account.description` | Connect copy when disconnected |
| `accountShowButtons` | `blockera.admin.panel.account.showButtons` | `false` |
| `bootstrapBreakpoints` | `blockera.breakpoints.*` | Custom breakpoint values when overlays may run; otherwise resets extras |
| `bootstrapGeneralPanel` | `blockera.admin.panel.settings.config` and visibility `onChange` filters | Restrict-visibility / roles / post types overlays |

Import for tests or reuse (not a second boot):

```js
import { ConnectWithBlockera } from '@blockera/auth-pro';
```

Account UI is owned by `auth-pro`. This package only mounts it through filters.

`bootstrapGeneralPanel` / `bootstrapBreakpoints` use `isAccountLicenseValid()` from `@blockera/validator` (same overlay gate as `registerEditorExtensions`). Do not copy a second account-field checklist into these files.

---

## PHP API

### `blockera_pro_override_providers( array $providers ): array`

On `blockera.application.providers` (priority 20): replaces free `AdminAssetsProvider` with `Blockera\Pro\Admin\Providers\BlockeraProAdminAssetsProvider`, then appends the free provider again so both can run.

### `blockera_pro_add_account_menu( array $menu ): array`

On `blockera.config.menu`: removes `upgrade-to-pro`, merges Pro `menu` config (Account).

### `BlockeraProAdminAssetsProvider`

Extends `Blockera\Bootstrap\AssetsProvider`. `boot()` runs only on `page` containing `blockera-settings` (skips site-editor save requests).

- Inline script handle filter: `blockera/wordpress/{id}/handle/inline-script`
- Before inline: `authorizationInlineScript` (OAuth / account globals for the admin app)
- Enqueues `products` with `@blockera/auth-pro` and `@blockera/blockera-pro-admin`. Package deps list `@blockera/products` before `@blockera/controls` so the products global exists when controls loads.

Do not enqueue this script on every `admin_enqueue_scripts` from another package.

---

## Rules for consumers

1. New settings panels: `addFilter` on existing `blockera.admin.*` names in `js/panels/`. Search free admin before adding a name.
2. Do not fork free admin panel components into this package.
3. License connect UI stays in `auth-pro`.
4. PHP menu / provider swaps stay in `php/hooks.php`.

---

## Tests

| File | Kind |
|------|------|
| `js/test/blockera-settings-account.panels.e2e.cy.js` | Cypress — account panel |
| `js/test/blockera-general-settings.panels.e2e.cy.js` | Cypress — general settings |

From repo root: `npm run test:e2e -- --spec <spec>`.

---

## Real consumers

| Consumer | Usage |
|----------|--------|
| Pro plugin admin bootstrap | Loads this package’s JS/PHP |
| `@blockera/auth-pro` | Account panel body |
| Free `@blockera/blockera-admin` | Filter host |

---

## Quick checklist for AI agents

- [ ] Filter names start from free admin; Pro only `addFilter`.
- [ ] Account UI changes go to `auth-pro`, not a copy here.
- [ ] Assets only on Blockera settings screens.
- [ ] Ask before changing free `blockera` admin APIs (`product-scope`).
