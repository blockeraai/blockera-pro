// @flow

/**
 * External dependencies
 */
import sha256 from 'crypto-js/sha256';

/**
 * Validate secret keys.
 *
 * @param {Array<Object>} possibleArgs - The possible arguments to test.
 *
 * @return {boolean} true on success, false on failure.
 */
export const validateSecretKeys = ({
	domain,
	clientId,
	licenseKey,
	clientSecret,
	subscriptionId,
}: {
	domain: string,
	clientId: string,
	licenseKey: string,
	clientSecret: string,
	subscriptionId: string,
}): Object | false => {
	const parts = licenseKey.split('-');
	const domainHash = parts[1];
	if (!domain || !subscriptionId) {
		if (process.env.NODE_ENV === 'development') {
			console.warn(
				'Your domain or license is not valid! please check your domain and license in the https://blockera.ai'
			);
		}
		return false;
	}
	const payloadToHash = domain + '_' + subscriptionId;
	const partialCheck = sha256(payloadToHash).toString().substring(0, 10);
	if (partialCheck !== domainHash) {
		if (process.env.NODE_ENV === 'development') {
			console.warn(
				'Your domain is not valid! please check your domain in the https://blockera.ai'
			);
		}
		return false;
	}
	if (licenseKey.length !== 32) return false;
	if ('string' !== typeof licenseKey) {
		if (process.env.NODE_ENV === 'development') {
			console.warn(
				'Your license is not valid! please check your license in the https://blockera.ai'
			);
		}
		return false;
	}
	if (!licenseKey) {
		if (process.env.NODE_ENV === 'development') {
			console.warn(
				'Your license is not valid! please check your license in the https://blockera.ai'
			);
		}
		return false;
	}
	if (parts.length !== 5) {
		if (process.env.NODE_ENV === 'development') {
			console.warn(
				'Your license is not valid! please check your license in the https://blockera.ai'
			);
		}
		return false;
	}
	if ('1' !== parts[0]) {
		if (process.env.NODE_ENV === 'development') {
			console.warn(
				'Your license is not valid! please check your license in the https://blockera.ai'
			);
		}
		return false;
	}
	if (!domain || !subscriptionId) {
		if (process.env.NODE_ENV === 'development') {
			console.warn(
				'Your domain or license is not valid! please check your domain and license in the https://blockera.ai'
			);
		}
		return false;
	}
	const data = domain + '_' + subscriptionId;
	const testHash = sha256(data).toString().substring(0, 10);
	if (testHash !== domainHash) {
		if (process.env.NODE_ENV === 'development') {
			console.warn(
				'Your license is not valid! please check your license in the https://blockera.ai'
			);
		}
		return false;
	}
	const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	if (!uuidRegex.test(clientId)) {
		if (process.env.NODE_ENV === 'development') {
			console.warn(
				'Your client id is not valid! please check your client id in the https://blockera.ai'
			);
		}
		return false;
	}
	if ('string' !== typeof clientId) {
		if (process.env.NODE_ENV === 'development') {
			console.warn(
				'Your client id is not valid! please check your client id in the https://blockera.ai'
			);
		}
		return false;
	}
	if (!clientId) {
		if (process.env.NODE_ENV === 'development') {
			console.warn(
				'Your client id is not valid! please check your client id in the https://blockera.ai'
			);
		}
		return false;
	}
	if (clientSecret.length !== 32) return false;
	if (!clientSecret) {
		if (process.env.NODE_ENV === 'development') {
			console.warn(
				'Your client secret is not valid! please check your client secret in the https://blockera.ai'
			);
		}
		return false;
	}
	if (typeof clientSecret !== 'string') {
		if (process.env.NODE_ENV === 'development') {
			console.warn(
				'Your client secret is not valid! please check your client secret in the https://blockera.ai'
			);
		}
		return false;
	}
	const hasUpperCase = /[A-Z]/.test(clientSecret);
	const hasLowerCase = /[a-z]/.test(clientSecret);
	const hasNumbers = /[0-9]/.test(clientSecret);
	const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(clientSecret);
	if (!hasUpperCase || !hasLowerCase || !hasNumbers || hasSpecialChars) {
		if (process.env.NODE_ENV === 'development') {
			console.warn(
				'Your client secret is not valid! please check your client secret in the https://blockera.ai'
			);
		}
		return false;
	}
	return true;
};
