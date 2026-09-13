// @flow

/**
 * External dependencies
 */
import { dispatch, select } from '@wordpress/data';

/**
 * Blockera dependencies
 */
import { STORE_NAME } from '@blockera/products';
import {
	evaluateAccountLicense,
	type TAccountLicenseMeta,
} from '@blockera/validator';

const PRO_PRODUCT_SLUG = 'blockera-pro';

/**
 * Write `meta.license` onto the registered `blockera-pro` product.
 *
 * Prefers `updateProduct` when the products package exposes it; otherwise
 * re-registers the existing product with merged meta.
 *
 * @param {{valid: boolean, status: string}} license License flags (no secrets).
 * @return {void}
 */
export function writeProProductLicense(license: TAccountLicenseMeta): void {
	const productsDispatch = dispatch(STORE_NAME);

	if (!productsDispatch) {
		return;
	}

	const patch = {
		meta: {
			license,
		},
	};

	if ('function' === typeof productsDispatch.updateProduct) {
		productsDispatch.updateProduct(PRO_PRODUCT_SLUG, patch);
		return;
	}

	const productsSelect = select(STORE_NAME);
	const existing = productsSelect?.getProduct?.(PRO_PRODUCT_SLUG);

	if (!existing || 'function' !== typeof productsDispatch.registerProduct) {
		return;
	}

	productsDispatch.registerProduct({
		...existing,
		meta: {
			...(existing.meta || {}),
			license,
		},
	});
}

/**
 * Evaluate the localized account and store the result on `blockera-pro`.
 *
 * @param {Object} [account] Account payload; defaults to `window.blockeraAccount`.
 * @return {boolean} true when the license is valid.
 */
export function syncProProductLicense(
	account: Object = window.blockeraAccount
): boolean {
	const license = evaluateAccountLicense(account);

	writeProProductLicense(license);

	return license.valid;
}
