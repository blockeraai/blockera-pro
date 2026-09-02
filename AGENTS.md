# Agents — Blockera Pro

Pro plugin that unlocks Site Builder Pro. Depends on the free plugin being present. Host packages live next to the GP submodule.

## Inspect

- Shared: [`packages/global-packages/packages/dev-tools/ai/index.md`](packages/global-packages/packages/dev-tools/ai/index.md)
- Product: [`.ai/index.md`](.ai/index.md)
- Gutenberg / WordPress: `source-codes/` (same routing as free plugin)
- Generated `.cursor/` — edit GP templates, not the host copy

## Host packages (product-only)

`blockera-pro`, `blockera-pro-admin`, `editor-pro`, `blocks-pro`, `controls-pro`, `auth-pro`, `guard`, `console`, `validator`, `notice`, `plugin-compatibility-pro`.

Public APIs for `*-pro` packages: that package’s `README.md` (see [`.ai/architecture.md`](.ai/architecture.md)).

## Constraints

- Active product **blockera-pro** when working here. GP writes: `packages/global-packages/`.
- Changelog/README after tasks: [`…/ai/workflows/changelog-and-readme.md`](packages/global-packages/packages/dev-tools/ai/workflows/changelog-and-readme.md)
- Scripts from **this** `package.json`: `npm run test:e2e`, `test:js`, `test:unit:php` — [`…/ai/workflows/product-scripts-and-deps.md`](packages/global-packages/packages/dev-tools/ai/workflows/product-scripts-and-deps.md)
- Stay compatible with free-plugin APIs. Do not silently change `blockera` unless the user expands scope.
