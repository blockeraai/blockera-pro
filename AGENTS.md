# Agents — Blockera Pro

Pro plugin that unlocks Site Builder Pro. Depends on the free plugin being present. Pro packages live in the GP submodule (`packages/global-packages/packages/*-pro*`).

## Inspect

- Shared: [`packages/global-packages/packages/dev-tools/ai/index.md`](packages/global-packages/packages/dev-tools/ai/index.md)
- Product: [`.ai/index.md`](.ai/index.md)
- Gutenberg / WordPress: `source-codes/` (same routing as free plugin)
- Generated `.cursor/` — edit GP templates, not the host copy

## Pro overlays

Pro application code lives in GP overlay packages. **Tests and project setup** only include packages listed in [`.ai/declared-gp-packages.md`](.ai/declared-gp-packages.md) (from this product’s lockfiles). Do not add `blocks-pro`, `console-pro`, or other overlays to PHPUnit/Jest because they exist on disk.

Public APIs: each package `README.md` (see [`.ai/architecture.md`](.ai/architecture.md)).

## Constraints

- Active product **blockera-pro** when working here. GP writes: `packages/global-packages/`.
- Changelog/README after tasks: [`…/ai/workflows/changelog-and-readme.md`](packages/global-packages/packages/dev-tools/ai/workflows/changelog-and-readme.md)
- Scripts from **this** `package.json`: `npm run test:e2e`, `test:js`, `test:unit:php` — [`…/ai/workflows/product-scripts-and-deps.md`](packages/global-packages/packages/dev-tools/ai/workflows/product-scripts-and-deps.md)
- Stay compatible with free-plugin APIs. Do not silently change `blockera` unless the user expands scope.

## Declared GP packages

<!-- generated:declared-gp-packages -->
Read [`.ai/declared-gp-packages.md`](.ai/declared-gp-packages.md) before changing PHPUnit, Jest, PHPCS, ESLint, Stylelint, or CI package filters. `project:bootstrap` rewrites that file from `package.json` `dependencies` and `composer.json` `require`. Do **not** add a GP package to those setups if it is missing from the generated list.
<!-- /generated:declared-gp-packages -->
