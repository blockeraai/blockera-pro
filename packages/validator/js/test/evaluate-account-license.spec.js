/**
 * Internal dependencies
 */
import { validateSecretKeys } from '../validate-secret-keys';
import {
	evaluateAccountLicense,
	isAccountLicenseValid,
} from '../evaluate-account-license';

jest.mock('../validate-secret-keys', () => ({
	validateSecretKeys: jest.fn(),
}));

describe('evaluateAccountLicense', () => {
	const originalCi = process.env.CI_ENV;

	const validAccount = (overrides = {}) => {
		const { license: licenseOverrides, ...rest } = overrides;

		return {
			client_id: 'cid',
			client_secret: 'csecret',
			access_token: 'at',
			refresh_token: 'rt',
			license: {
				id: '99',
				type: 'subscription',
				name: '#99 - Example',
				status: 'active',
				startDate: '2020-01-01',
				licenseKey: 'key',
				nextPaymentDueDate: '2099-01-01',
				...licenseOverrides,
			},
			...rest,
		};
	};

	beforeEach(() => {
		process.env.CI_ENV = 'false';
		validateSecretKeys.mockReturnValue(true);
	});

	afterEach(() => {
		process.env.CI_ENV = originalCi;
		jest.clearAllMocks();
	});

	it('treats non-false CI_ENV as valid without reading the account', () => {
		process.env.CI_ENV = 'true';

		expect(evaluateAccountLicense(undefined)).toEqual({
			valid: true,
			status: 'active',
		});
		expect(validateSecretKeys).not.toHaveBeenCalled();
	});

	it('returns missing when the account is empty', () => {
		expect(evaluateAccountLicense(null)).toEqual({
			valid: false,
			status: 'missing',
		});
	});

	it('returns invalid when required fields are missing', () => {
		expect(
			evaluateAccountLicense({
				license: { id: '99' },
			})
		).toEqual({
			valid: false,
			status: 'invalid',
		});
	});

	it('returns expired for a past-due subscription', () => {
		expect(
			evaluateAccountLicense(
				validAccount({
					license: { nextPaymentDueDate: '2000-01-01' },
				})
			)
		).toEqual({
			valid: false,
			status: 'expired',
		});
	});

	it('returns active flags without secrets when the account is complete', () => {
		const meta = evaluateAccountLicense(validAccount());

		expect(meta).toEqual({
			valid: true,
			status: 'active',
		});
		expect(meta).not.toHaveProperty('licenseKey');
		expect(isAccountLicenseValid(validAccount())).toBe(true);
	});
});
