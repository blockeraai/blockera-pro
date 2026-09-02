# `@blockera/blockera-pro`

Pro plugin **application bootstrap**. Wires editor assets, REST routes, product registry, and the editor React boot that calls `editor-pro` / `controls-pro`.

This is a **side-effect boot**, not a utility library. Do not import it from GP or from the free plugin.

> Pair with product notes: [`../../.ai/architecture.md`](../../.ai/architecture.md). Free vs Pro overlay model lives in GP `packages/dev-tools/ai/domains/free-vs-pro.md`.

---

## Why it exists

The free plugin boots `@blockera/blockera`. Pro needs a second application (`$blockera_pro`) that:

- Replaces the free editor assets provider so `dist/blockera-pro` loads in the editor
- Registers Pro REST routes (auth lives in `@blockera/auth-pro`, routes are declared here)
- Injects account data into the Blockera data entity
- Registers this plugin in the products registry

---

## Package layout

```text
packages/blockera-pro/
├── js/index.js              # Editor boot (hooks)
├── php/
│   ├── app.php              # Instantiates BlockeraPro and bootstraps
│   ├── BlockeraPro.php      # Application container
│   ├── functions.php        # Public PHP helpers
│   ├── hooks.php            # WP filters/actions
│   ├── Routes/api.php       # REST route map
│   └── Providers/           # Assets, REST, AppServiceProvider
├── package.json             # @blockera/blockera-pro
└── composer.json            # blockera/blockera-pro
```

| Side | Package name | Entry |
|------|----------------|-------|
| JS | `@blockera/blockera-pro` | `js/index.js` |
| PHP | `blockera/blockera-pro` | PSR-4 `Blockera\Pro\` + `php/functions.php` |

---

## JS API

There is **no reusable component API**. The entry is a boot:

```js
import { applyControls } from '@blockera/controls-pro';
import {
	applyExtensions,
	bootstrapCanvasEditor,
	applyDefaultBlockStates,
	registerEditorExtensions,
} from '@blockera/editor-pro';
```

On load it:

1. Calls `applyDefaultBlockStates()` immediately (default extra states overlay).
2. Registers `addFilter('blockera.before.bootstrap', 'blockera.pro.bootstrap', …)` so free bootstrap runs Pro init **before** the free app finishes.
3. That callback runs `bootstrapCanvasEditor()`, `registerEditorExtensions()`, `applyControls()`, `applyExtensions()`.

Do not call those four functions from a new boot file. Extend the existing packages instead.

---

## PHP API

Autoload: `Blockera\Pro\` → `php/`. File autoload: `php/functions.php`.

### Application

| Symbol | Role |
|--------|------|
| `Blockera\Pro\BlockeraPro` | Extends `Blockera\Bootstrap\Application`. Constructed in `php/app.php` as global `$blockera_pro`. |
| `setLicense( array $license ): void` | Store license payload on the app. |
| `getLicense(): array` | Read it. |

Providers (registered from Pro config `app.providers`):

| Class | Role |
|-------|------|
| `Blockera\Pro\Providers\AppServiceProvider` | Binds `Blockera\Auth\Client`, `Auth\Config`, `Validator`, `Upgrade\ProPlugin`, cache. |
| `Blockera\Pro\Providers\BlockeraProEditorAssetsProvider` | Enqueues Pro editor script after icons; localizes current user / allowed-users filters. |
| `Blockera\Pro\Providers\BlockeraPRORestAPIProvider` | Loads `php/Routes/api.php`. |

### Helpers (`php/functions.php`)

| Function | Description |
|----------|-------------|
| `blockera_pro_core_config( string $key )` | Pro config via `blockera_core_config`, root = `BLOCKERA_PRO_PATH`. |
| `blockera_pro_get_root_path(): string` | Plugin filesystem root. |
| `blockera_pro_get_root_url(): string` | Plugin URL. |
| `blockera_pro_get_product_details(): array` | Products-registry payload from plugin headers (`slug` = `blockera-pro`). |
| `blockera_pro_register_product(): void` | Registers that payload when the entry file lives under `WP_PLUGIN_DIR`. |

### Hooks (`php/hooks.php`)

| Hook | Callback | Effect |
|------|----------|--------|
| `blockera/config/entities` | `blockera_pro_get_filtered_entities` | Sets `entities['blockera']['account']` from Pro config. |
| `blockera.application.providers` | `blockera_pro_override_editor_assets_provider` | Swaps free `EditorAssetsProvider` for `BlockeraProEditorAssetsProvider`. |
| `blockera/products/registry/init` | `blockera_pro_register_product` | Product registry. |

### REST (`php/Routes/api.php`)

All `POST` under the Blockera REST prefix (`/blockera/v1/…`). Handlers are on `Blockera\Auth\Http\Controllers\ConnectionController`:

| Path | Method |
|------|--------|
| `auth/licenses` | `getLicenses` |
| `auth/unsubscribe` | `unsubscribe` |
| `auth/is-connected` | `isConnected` |
| `auth/create-account` | `createAccount` |
| `auth/connect-account` | `connectAccount` |
| `auth/clear-licenses` | `clearLicenses` |

Do not duplicate these routes in another package.

### Notices (`php/notices.php`)

`blockera_pro_remove_notice_blockera_required()` — drops the “free plugin required” notice when `blockera/blockera.php` is active.

---

## Rules for consumers

1. Boot Pro from the plugin entry (`blockera-pro.php` → this package). Do not instantiate `BlockeraPro` from GP.
2. New editor unlocks belong in `editor-pro` / `controls-pro` / `blocks-pro`, then stay wired from `js/index.js` — do not add a second `blockera.before.bootstrap` boot.
3. New REST auth endpoints: add the route here and the controller method in `auth-pro`.
4. Do not reimplement license checks in this package; unlocks already live in the packages this boot calls.

---

## Tests

| File | Kind |
|------|------|
| `php/tests/ProductRegistrationTest.php` | PHPUnit — product registry helpers |
| `php/tests/TestCase.php` | PHPUnit base |

From the **blockera-pro repo root**: `npm run test:unit:php`, `npm run test:js`, `npm run test:e2e`. Do not invent runners.

---

## Real consumers

| Consumer | Usage |
|----------|--------|
| `blockera-pro.php` | Loads PHP app, hooks, notices |
| Free editor bootstrap | `blockera.before.bootstrap` |
| `@blockera/editor-pro`, `@blockera/controls-pro` | Called from this JS boot |

---

## Quick checklist for AI agents

- [ ] Change editor overlay behavior in `editor-pro` / `controls-pro`, not by copying boot logic here.
- [ ] New auth REST: `Routes/api.php` + `ConnectionController`.
- [ ] Config reads: `blockera_pro_core_config()`, not a new helper.
- [ ] Keep JS ↔ PHP account entity injection in sync (`hooks.php` + editor packages that read `window` / data store).
