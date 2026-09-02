# Blockera Pro architecture

Unlocks paid editor/admin features on top of the free plugin. PHP entry: `blockera-pro.php`.

Public APIs for `*-pro` packages: each package `README.md` (quality bar: GP `@blockera/storage`).

## Host packages

| Package | Role | README |
|---------|------|--------|
| `blockera-pro` | Pro application bootstrap / editor assets | [`packages/blockera-pro/README.md`](../packages/blockera-pro/README.md) |
| `blockera-pro-admin` | Pro settings UI | [`packages/blockera-pro-admin/README.md`](../packages/blockera-pro-admin/README.md) |
| `editor-pro` | Pro editor extensions (states, mouse, canvas, …) | [`packages/editor-pro/README.md`](../packages/editor-pro/README.md) |
| `blocks-pro` | Pro block extensions / e2e (`@blockera/blocks-pro-core`) | [`packages/blocks-pro/core/README.md`](../packages/blocks-pro/core/README.md) |
| `controls-pro` | Pro controls | [`packages/controls-pro/README.md`](../packages/controls-pro/README.md) |
| `auth-pro` | Licensing / auth | [`packages/auth-pro/README.md`](../packages/auth-pro/README.md) |
| `guard` / `validator` / `console` | Pro security and CLI-style tooling | — |
| `notice` | In-editor notices | — |
| `plugin-compatibility-pro` | Pro compatibility gate | [`packages/plugin-compatibility-pro/README.md`](../packages/plugin-compatibility-pro/README.md) |

## Tests

From this repo root: `npm run test:e2e`, `test:ct`, `test:js`, `test:unit:php`. Do not invent runners.
