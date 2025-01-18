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
	subscriberId,
	clientSecret,
	subscriptionId,
}: {
	domain: string,
	clientId: string,
	subscriberId: string,
	clientSecret: string,
	subscriptionId: string,
}): Object | false => {
	const parts = subscriberId.split('-');
	const domainHash = parts[1];
	if (!domain || !subscriptionId) {
		return false;
	}
	const payloadToHash = domain + '_' + subscriptionId;
	const partialCheck = sha256(payloadToHash).toString().substring(0, 10);
	if (partialCheck !== domainHash) {
		return false;
	}
	if (subscriberId.length !== 32) return false;
	if ('string' !== typeof subscriberId) {
		return false;
	}
	if (!subscriberId) {
		return false;
	}
	if (parts.length !== 5) {
		return false;
	}
	if (1 !== parts[0]) {
		return false;
	}
	if (!domain || !subscriptionId) {
		return false;
	}
	const data = domain + '_' + subscriptionId;
	const testHash = sha256(data).toString().substring(0, 10);
	if (testHash !== domainHash) {
		return false;
	}
	const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	if (!uuidRegex.test(clientId)) {
		return false;
	}
	if ('string' !== typeof clientId) {
		return false;
	}
	if (!clientId) {
		return false;
	}
	if (clientSecret.length !== 32) return false;
	if (!clientSecret) {
		return false;
	}
	if (typeof clientSecret !== 'string') {
		return false;
	}
	const hasUpperCase = /[A-Z]/.test(clientSecret);
	const hasLowerCase = /[a-z]/.test(clientSecret);
	const hasNumbers = /[0-9]/.test(clientSecret);
	const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(clientSecret);
	if (!hasUpperCase || !hasLowerCase || !hasNumbers || hasSpecialChars) {
		return false;
	}
	return true;
};
