# `@blockera/auth-pro`

OAuth client, license list UI, option storage, and plugin-update transients for Blockera Pro.

Admin **connect** UI is this package. REST routes are registered by `@blockera/blockera-pro` (`php/Routes/api.php`). Secret-key math for editor unlocks is `@blockera/validator`, not this package.

---

## Why it exists

Pro must talk to blockera.ai (OAuth, licenses, zip updates) without putting that client in GP or the free plugin.

---

## Package layout

```text
packages/auth-pro/
├── js/
│   ├── index.js                 # ConnectWithBlockera
│   ├── licenses.js              # License cards
│   └── confetti-bomb.js         # Internal celebration
├── php/
│   ├── Client.php
│   ├── Config.php
│   ├── Validator.php            # Plan allow-list (PHP)
│   ├── Jobs.php
│   ├── functions.php
│   ├── Http/Controllers/ConnectionController.php
│   ├── Repositories/OptionRepository.php
│   └── Upgrade/ProPlugin.php
├── package.json                 # @blockera/auth-pro
└── composer.json                # blockera/auth-pro
```

| Side | Package name | Entry |
|------|----------------|-------|
| JS | `@blockera/auth-pro` | `js/index.js` |
| PHP | `blockera/auth-pro` | PSR-4 `Blockera\Auth\` + `php/functions.php` |

---

## JS API

```js
import { ConnectWithBlockera } from '@blockera/auth-pro';
```

### `ConnectWithBlockera({ isConnected: boolean })`

Settings Account panel body (mounted from `@blockera/blockera-pro-admin`).

- Disconnected: activate CTA (`window.blockeraActivateUrl`).
- Connected: congratulations + “Manage your license” (POST `/blockera/v1/auth/licenses`).
- When `window.blockeraAIAccount.licenses` is set: `<Licenses />`.

Window globals expected on the settings screen (injected by `BlockeraProAdminAssetsProvider`): `blockeraAIAccount`, `blockeraActivateUrl`, `blockeraConnectActionNonce`, `wpCreatePageUrl`.

`Licenses` and `fireConfettiBomb` are internal. Do not import them from other packages unless you are extending this UI in-tree.

---

## PHP API

Namespace `Blockera\Auth`.

### `Client`

OAuth2 wrapper around `League\OAuth2\Client\Provider\GenericProvider`.

| Method | Role |
|--------|------|
| `__construct( GenericProvider $provider )` | Bound in `Blockera\Pro\Providers\AppServiceProvider` |
| `auth( array $client_info ): void` | Callback / connect flow |
| `getProvider(): GenericProvider` | Underlying provider |
| `save(): array` | Persist client info |

### `Config`

Static/instance config for API URLs, product id, plugin slug, icons, unsubscribe / zip URLs. Constructed from Pro auth config. Use `Config::get( $key )` and the existing getters/setters; do not add a parallel config class.

### `OptionRepository`

| Method | Role |
|--------|------|
| `getOptionKey()` | `blockera-oauth-credentials` |
| `getPrefixTransientKey()` | `__subscription-` |
| `setOption( $value ): bool` | `update_option` |
| `getOption( string $key = '', array $default = [] )` | All or one key |
| `getTransient` / `setTransient` | Subscription transients |
| `getLicense( array $oauth_option = [] ): array` | License slice |

### `ConnectionController`

REST handlers (routes in `blockera-pro`). `permission()`: `manage_options` + nonce `blockera-connect-with-your-account` (`X-Blockera-Nonce`), except `auth/clear-licenses`.

| Method | Route (POST) |
|--------|----------------|
| `connectAccount` | `auth/connect-account` |
| `createAccount` | `auth/create-account` |
| `isConnected` | `auth/is-connected` |
| `getLicenses` | `auth/licenses` |
| `clearLicenses` | `auth/clear-licenses` |

`php/Routes/api.php` in `blockera-pro` also registers `auth/unsubscribe`. Add the controller method in this package if you implement that route; do not leave the route pointing at a missing action.

### `Validator` (PHP)

`isAllowedPlan( string $plan ): bool` plus `__call` forwarding. This is **plan** validation, not JS `validateSecretKeys`.

### `Jobs`

Cron-style: `blockera_pro_each_per_day` → `verifyLicenseStatus()`; `blockera_pro_each_per_ten_days` → `doRefreshToken()`.

### `Upgrade\ProPlugin`

WordPress plugin-update transients and plugin-information for the Pro zip (`setUpdatePluginTransient`, `getPluginInformation`).

### `blockera_auth_pro_cleanup_auth_data( string $key ): bool`

Deletes options whose names `LIKE %$key%`. Use only for documented cleanup paths.

---

## Rules for consumers

1. Do not reimplement OAuth in GP or free `blockera`.
2. Do not copy `validateSecretKeys` into this package; editor unlocks use `@blockera/validator`.
3. New REST methods: controller here **and** route in `blockera-pro`.
4. Admin mount point is `blockera-pro-admin` filters, not a direct `render()` from PHP.

---

## Tests

PHPUnit under `php/tests/` when present. Admin e2e: `blockera-pro-admin/js/test/blockera-settings-account.panels.e2e.cy.js`. From repo root: `npm run test:unit:php`, `npm run test:e2e`.

---

## Real consumers

| Consumer | Usage |
|----------|--------|
| `@blockera/blockera-pro-admin` | `ConnectWithBlockera` |
| `Blockera\Pro\Providers\AppServiceProvider` | Binds Client / Config / Validator / ProPlugin |
| `blockera-pro` REST provider | Routes |

---

## Quick checklist for AI agents

- [ ] UI: `js/index.js` / `licenses.js`. Persistence: `OptionRepository`. HTTP: `ConnectionController`.
- [ ] Keep route table in `blockera-pro/php/Routes/api.php` in sync.
- [ ] Do not document or invent new unlock math; reuse `@blockera/validator` where the editor already does.
