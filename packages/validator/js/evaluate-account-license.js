// @flow

/**
 * Blockera dependencies
 */
import { validateSecretKeys } from './validate-secret-keys';

export type TAccountLicenseMeta = {
	valid: boolean,
	status: 'active' | 'invalid' | 'expired' | 'missing',
};

/**
 * Evaluate a localized account payload into products `meta.license` flags.
 *
 * Does not return keys, tokens, or secrets. When `CI_ENV` is not `'false'`,
 * treats the license as valid so e2e can run.
 *
 * @param {Object} account `window.blockeraAccount` shape.
 * @return {TAccountLicenseMeta} coarse license flags.
 */
export function evaluateAccountLicense(account: Object): TAccountLicenseMeta {
	if ('false' !== process.env.CI_ENV) {
		return {
			valid: true,
			status: 'active',
		};
	}

	if (!account || 'object' !== typeof account) {
		return {
			valid: false,
			status: 'missing',
		};
	}

	const {
		client_id: clientId,
		client_secret: clientSecret,
		access_token: accessToken,
		refresh_token: refreshToken,
		license,
	} = account;
	const id = license?.id;
	const type = license?.type;
	const name = license?.name;
	const status = license?.status;
	const orderId = license?.orderId;
	const startDate = license?.startDate;
	const licenseKey = license?.licenseKey;
	const nextPaymentDueDate = license?.nextPaymentDueDate;

	if (
		!id ||
		!accessToken ||
		!refreshToken ||
		!status ||
		!name ||
		!licenseKey ||
		!nextPaymentDueDate ||
		!startDate ||
		!clientId ||
		!clientSecret ||
		(!orderId && 'non-subscription' === type)
	) {
		return {
			valid: false,
			status: account.license ? 'invalid' : 'missing',
		};
	}

	if ('active' !== status) {
		return {
			valid: false,
			status: 'invalid',
		};
	}

	const domain = window.location.origin;
	const subscriptionId = id;
	const validated = validateSecretKeys({
		domain,
		clientId,
		clientSecret,
		licenseKey,
		subscriptionId,
	});

	if (!validated) {
		return {
			valid: false,
			status: 'invalid',
		};
	}

	if (
		!String(name).startsWith(`${orderId} - `) &&
		'non-subscription' === type
	) {
		return {
			valid: false,
			status: 'invalid',
		};
	}

	if (!String(name).startsWith(`${id} - `) && 'subscription' === type) {
		return {
			valid: false,
			status: 'invalid',
		};
	}

	if (new Date(nextPaymentDueDate) < new Date() && 'subscription' === type) {
		return {
			valid: false,
			status: 'expired',
		};
	}

	if (new Date(startDate) > new Date() && 'subscription' === type) {
		return {
			valid: false,
			status: 'invalid',
		};
	}

	return {
		valid: true,
		status: 'active',
	};
}

/**
 * Whether overlays that add Pro behavior may run.
 *
 * @param {Object} [account] Account payload; defaults to `window.blockeraAccount`.
 * @return {boolean} true when the license is valid (or CI skip).
 */
export function isAccountLicenseValid(
	account: Object = window.blockeraAccount
): boolean {
	return true === evaluateAccountLicense(account).valid;
}
