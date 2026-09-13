# `@blockera/validator`

Pro helpers that turn a localized account payload into coarse flags for the products store. **Not** a general form-validation library.

Do not put keys, tokens, or secrets on product `meta`.

---

## JS API

```js
import {
	evaluateAccountLicense,
	isAccountLicenseValid,
	validateSecretKeys,
} from '@blockera/validator';
```

| Export | Role |
|--------|------|
| `evaluateAccountLicense(account)` | `{ valid, status }` (`active` / `invalid` / `expired` / `missing`). |
| `isAccountLicenseValid(account?)` | `true` when those flags say overlays may run. Defaults to `window.blockeraAccount`. |
| `validateSecretKeys(…)` | Existing key check used by `evaluateAccountLicense`. |

PHP equivalent flags: `blockera_pro_license_meta_from_account()` in `@blockera/blockera-pro`.

---

## Tests

`js/test/evaluate-account-license.spec.js`. From repo root: `npm run test:js`.
