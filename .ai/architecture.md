# Blockera Pro architecture

Unlocks paid editor/admin features on top of the free plugin. PHP entry: `blockera-pro.php`.

## Host packages

| Package | Role |
|---------|------|
| `blockera-pro` | Pro application bootstrap / editor assets |
| `blockera-pro-admin` | Pro settings UI |
| `editor-pro` | Pro editor extensions (states, mouse, canvas, …) |
| `blocks-pro` | Pro block extensions |
| `controls-pro` | Pro controls |
| `auth-pro` | Licensing / auth |
| `guard` / `validator` / `console` | Pro security and CLI-style tooling |
| `notice` | In-editor notices |
| `plugin-compatibility-pro` | Pro compatibility gate |

## Tests

From this repo root: `npm run test:e2e`, `test:ct`, `test:js`, `test:unit:php`. Do not invent runners.
