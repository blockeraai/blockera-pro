// @flow

/**
 * Native/promo block-state locks are lifted by `@blockera/products` when
 * `blockera-pro` has `meta.license.valid`. These remain no-ops so existing
 * boot calls stay valid.
 *
 * @return {void}
 */
export const applyBlockStates = (): void => {};

/**
 * Extra state definitions stay filterable; native flags are unlocked via the
 * products store. Kept as a no-op for the existing boot call.
 *
 * @return {void}
 */
export const applyDefaultBlockStates = (): void => {};
