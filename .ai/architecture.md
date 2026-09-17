# Blockera Pro architecture

Unlocks paid editor/admin features on top of the free plugin. PHP entry: `blockera-pro.php`.

Public APIs for `*-pro` packages: each package `README.md` (quality bar: GP `@blockera/storage`).

## Packages (in global-packages)

Pro overlays live under `packages/global-packages/packages/`. **PHPUnit / Jest / PHPCS allow-list** is [declared-gp-packages.md](declared-gp-packages.md) (`project:bootstrap`), not this catalog. The free plugin does not `require` these overlays.

Roles (do not add a row to test setup unless the lockfile lists it):

| Package | Role | README |
|---------|------|--------|
| `blockera-pro` | Pro application bootstrap / editor assets | [`packages/global-packages/packages/blockera-pro/README.md`](../packages/global-packages/packages/blockera-pro/README.md) |
| `blockera-pro-admin` | Pro settings UI | [`packages/global-packages/packages/blockera-pro-admin/README.md`](../packages/global-packages/packages/blockera-pro-admin/README.md) |
| `editor-pro` | Pro editor extensions (states, mouse, canvas, …) | [`packages/global-packages/packages/editor-pro/README.md`](../packages/global-packages/packages/editor-pro/README.md) |
| `blocks-pro` | Pro block extensions / e2e (`@blockera/blocks-pro-core`) | [`packages/global-packages/packages/blocks-pro/core/README.md`](../packages/global-packages/packages/blocks-pro/core/README.md) |
| `controls-pro` | Pro controls | [`packages/global-packages/packages/controls-pro/README.md`](../packages/global-packages/packages/controls-pro/README.md) |
| `auth-pro` | Licensing / auth | [`packages/global-packages/packages/auth-pro/README.md`](../packages/global-packages/packages/auth-pro/README.md) |
| `guard-pro` / `validator-pro` / `console-pro` | Pro security and CLI-style tooling | — |
| `plugin-compatibility-pro` | Pro compatibility gate | [`packages/global-packages/packages/plugin-compatibility-pro/README.md`](../packages/global-packages/packages/plugin-compatibility-pro/README.md) |

## Tests

From this repo root: `npm run test:e2e`, `test:ct`, `test:js`, `test:unit:php`. Do not invent runners. Package allow-list: [declared-gp-packages.md](declared-gp-packages.md).
