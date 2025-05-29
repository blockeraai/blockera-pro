// @flow
/**
 * External dependencies
 */
import type { Node } from 'react';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';

/**
 * Blockera dependencies
 */
import { FeatureWrapper } from '@blockera/controls';
import { isBoolean, isArray } from '@blockera/utils';
import { validateSecretKeys } from '@blockera/validator';

/**
 * Internal dependencies
 */
import {
	isBaseBreakpoint,
	getBaseBreakpoint,
	useExtensionsStore,
} from '@blockera/editor';
import type { EditorFeatureWrapperProps } from '../../../blockera-pro/js/types';

export const EditorFeatureWrapper = ({
	config,
	isActive = true,
	children,
	...props
}: EditorFeatureWrapperProps): Node => {
	const {
		currentBlock,
		currentState,
		currentBreakpoint,
		currentInnerBlockState,
	} = useExtensionsStore();
	const getCurrentState = (): string =>
		'master' !== currentBlock ? currentInnerBlockState : currentState;
	const {
		blockera: { account },
	} = useSelect((select) => {
		const { getEntity } = select('blockera/data');

		return {
			blockera: getEntity('blockera'),
		};
	});
	const {
		client_id: clientId,
		client_secret: clientSecret,
		access_token: accessToken,
		refresh_token: refreshToken,
		license: {
			id,
			name,
			status,
			startDate,
			licenseKey,
			nextPaymentDueDate,
		},
	} = account || {
		license: {},
	};

	const [isAvailable, setIsAvailable] = useState(false);

	useEffect(() => {
		const domain = window.location.origin;
		const subscriptionId = id;

		if ('false' === process.env.CI_ENV) {
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
				!clientSecret
			) {
				return;
			}

			if ('active' !== status) {
				return;
			}

			// Start Validation: Secret keys.
			const validated = validateSecretKeys({
				domain,
				clientId,
				clientSecret,
				licenseKey,
				subscriptionId,
			});

			if (!validated) {
				if (process.env.NODE_ENV === 'development') {
					console.warn(
						'Invalid registered license! please check your domain and license in the https://blockera.ai'
					);
				}
				return;
			}
			// End Validation: Secret keys.

			// Validation: Subscription name.
			if (-1 === name.startsWith(`#${id} - `)) {
				if (process.env.NODE_ENV === 'development') {
					console.warn(
						'Invalid registered license! please check your domain and license in the https://blockera.ai'
					);
				}
				return;
			}

			// Validation: Next payment due date.
			if (new Date(nextPaymentDueDate) < new Date()) {
				if (process.env.NODE_ENV === 'development') {
					console.warn(
						'Your license is expired! please check your domain and license in the https://blockera.ai'
					);
				}
				return;
			}

			// Validation: Start date.
			if (new Date(startDate) > new Date()) {
				if (process.env.NODE_ENV === 'development') {
					console.warn(
						'Your license is not started! it seems that your license invalid or ex please check your domain and license in the https://blockera.ai'
					);
				}
				return;
			}
		}

		// 🔓 Unlock the locked feature.
		setIsAvailable(true);
	}, [
		id,
		licenseKey,
		nextPaymentDueDate,
		startDate,
		name,
		clientId,
		clientSecret,
		status,
		accessToken,
		refreshToken,
	]);

	const feature = {
		isActiveOnFree: true,
		isActiveOnStates: true,
		isActiveOnStatesOnFree: true,
		isActiveOnBreakpoints: true,
		isActiveOnBreakpointsOnFree: true,
		isActiveOnInnerBlocks: true,
		isActiveOnInnerBlocksOnFree: false,
		...config,
	};

	if (!isActive) {
		return <></>;
	}

	if (!isAvailable && !feature.isActiveOnFree) {
		return (
			<FeatureWrapper type="free" {...props}>
				{children}
			</FeatureWrapper>
		);
	}

	if ('master' !== currentBlock) {
		if (
			isBoolean(feature.isActiveOnInnerBlocks) &&
			!feature.isActiveOnInnerBlocks
		) {
			return (
				<FeatureWrapper type="inner-block" {...props}>
					{children}
				</FeatureWrapper>
			);
		} else if (
			isArray(feature.isActiveOnInnerBlocks) &&
			//$FlowFixMe
			!feature.isActiveOnInnerBlocks.includes(currentBlock)
		) {
			return (
				<FeatureWrapper type="inner-block" {...props}>
					{children}
				</FeatureWrapper>
			);
		}

		if (!isAvailable && !feature.isActiveOnInnerBlocksOnFree) {
			return (
				<FeatureWrapper type="free" {...props}>
					{children}
				</FeatureWrapper>
			);
		}
	}

	if ('normal' !== getCurrentState()) {
		if (isBoolean(feature.isActiveOnStates) && !feature.isActiveOnStates) {
			return (
				<FeatureWrapper type="state" typeName={'normal'} {...props}>
					{children}
				</FeatureWrapper>
			);
		} else if (
			isArray(feature.isActiveOnStates) &&
			//$FlowFixMe
			!feature.isActiveOnStates.includes(getCurrentState())
		) {
			return (
				<FeatureWrapper type="state" typeName={'normal'} {...props}>
					{children}
				</FeatureWrapper>
			);
		}

		if (!isAvailable && !feature.isActiveOnStatesOnFree) {
			return (
				<FeatureWrapper type="free" {...props}>
					{children}
				</FeatureWrapper>
			);
		}
	}

	if (!isBaseBreakpoint(currentBreakpoint)) {
		if (
			isBoolean(feature.isActiveOnBreakpoints) &&
			!feature.isActiveOnBreakpoints
		) {
			return (
				<FeatureWrapper
					type="breakpoint"
					typeName={getBaseBreakpoint()}
					{...props}
				>
					{children}
				</FeatureWrapper>
			);
		} else if (
			isArray(feature.isActiveOnBreakpoints) &&
			//$FlowFixMe
			!feature.isActiveOnBreakpoints.includes(currentBreakpoint)
		) {
			return (
				<FeatureWrapper
					type="breakpoint"
					typeName={getBaseBreakpoint()}
					{...props}
				>
					{children}
				</FeatureWrapper>
			);
		}

		if (!isAvailable && !feature.isActiveOnBreakpointsOnFree) {
			return (
				<FeatureWrapper type="free" {...props}>
					{children}
				</FeatureWrapper>
			);
		}
	}

	return <>{children}</>;
};
