// @flow

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import type { MixedElement } from 'react';
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';

/**
 * Blockera dependencies
 */
import { Button, Flex } from '@blockera/controls';

/**
 * Internal dependencies
 */
import { Licenses } from './licenses';
import { fireConfettiBomb } from './confetti-bomb';

// FIXME: This icon must be moved to the Blockera icon package and import from there. @ali
const AttachIcon = ({ fill }: { fill: string }): MixedElement => (
	<svg
		width="12"
		height="13"
		viewBox="0 0 12 13"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M10.1148 2.3852C9.37056 1.64096 7.94681 1.64447 6.92556 2.66573L6.08256 3.50872C5.81754 3.77374 5.38786 3.77374 5.12284 3.50872C4.85782 3.2437 4.85782 2.81402 5.12284 2.54899L5.96583 1.706C7.39092 0.280909 9.68229 0.0332314 11.0745 1.42547C12.4668 2.81771 12.2191 5.10908 10.794 6.53417L9.951 7.37716C9.68598 7.64218 9.2563 7.64218 8.99128 7.37716C8.72626 7.11214 8.72626 6.68246 8.99128 6.41743L9.83427 5.57444C10.8555 4.55319 10.859 3.12944 10.1148 2.3852ZM8.00566 4.49452C8.27068 4.75954 8.27068 5.18922 8.00566 5.45424L4.9541 8.5058C4.68908 8.77082 4.25939 8.77082 3.99437 8.5058C3.72935 8.24078 3.72935 7.8111 3.99437 7.54607L7.04593 4.49452C7.31095 4.2295 7.74064 4.2295 8.00566 4.49452ZM3.00872 5.62319C3.27374 5.88821 3.27374 6.31789 3.00872 6.58291L2.16573 7.4259C1.14447 8.44716 1.14096 9.87091 1.8852 10.6151C2.62944 11.3594 4.05319 11.3559 5.07444 10.3346L5.91744 9.49163C6.18246 9.22661 6.61214 9.22661 6.87716 9.49163C7.14218 9.75665 7.14218 10.1863 6.87716 10.4514L6.03417 11.2943C4.60908 12.7194 2.31771 12.9671 0.925471 11.5749C-0.46677 10.1826 -0.219089 7.89127 1.206 6.46618L2.049 5.62319C2.31402 5.35817 2.7437 5.35817 3.00872 5.62319Z"
			fill={fill}
		/>
	</svg>
);

export const ConnectWithBlockera = ({
	isConnected,
}: {
	isConnected: boolean,
}): MixedElement => {
	const {
		blockeraAIAccount,
		blockeraActivateUrl,
		blockeraConnectActionNonce,
	} = window;
	const [isForceManageLicense, setIsForceManageLicense] = useState(false);

	const fetchLicenses = () => {
		apiFetch({
			method: 'POST',
			path: '/blockera/v1/auth/licenses',
			headers: {
				'X-Blockera-Nonce': blockeraConnectActionNonce,
			},
			data: {
				action: 'licenses',
			},
		}).then((response) => {
			if (response.success) {
				window.blockeraAIAccount = response.data;

				setIsForceManageLicense(true);
			}
		});
	};

	useEffect(() => {
		if (isConnected && !isForceManageLicense) {
			fireConfettiBomb(0.25, {
				spread: 26,
				startVelocity: 55,
			});
			fireConfettiBomb(0.2, {
				spread: 60,
			});
			fireConfettiBomb(0.35, {
				spread: 100,
				decay: 0.91,
				scalar: 0.8,
			});
			fireConfettiBomb(0.1, {
				spread: 120,
				startVelocity: 25,
				decay: 0.92,
				scalar: 1.2,
			});
			fireConfettiBomb(0.1, {
				spread: 120,
				startVelocity: 45,
			});
		}
	}, [isConnected, isForceManageLicense]);

	if (isConnected && !isForceManageLicense) {
		return (
			<div className="blockera-auth-container">
				<h1 className="blockera-auth-congratulations">
					{__('🎉 Congratulations!', 'blockera')}
					<span style={{ display: 'block' }}>
						{__(
							'Your Blockera Pro license is activated.',
							'blockera'
						)}
					</span>
				</h1>
				<p>
					{__(
						'Blockera Pro is successfully connected to your site!',
						'blockera'
					)}
				</p>
				<p>
					{__(
						'You’re all set to unlock the full potential of advanced design tools and features.',
						'blockera'
					)}
				</p>
				<Flex gap={10} className="blockera-auth-success-buttons">
					<Button
						variant="primary"
						className="create-page"
						onClick={() =>
							(window.location.href = window.wpCreatePageUrl)
						}
					>
						{__('Create a Page', 'blockera')}
					</Button>
					<Button
						variant="secondary"
						className="manage-licenses"
						onClick={fetchLicenses}
					>
						{__('Manage your license', 'blockera')}
					</Button>
				</Flex>
			</div>
		);
	}

	if (blockeraAIAccount?.licenses?.length) {
		return <Licenses accountInfo={blockeraAIAccount} />;
	}

	return (
		<div className="blockera-auth-container">
			<h1 className="title">
				{__('Connect your site to your Pro license', 'blockera')}
			</h1>
			<p className="description">
				{__(
					'Activate the Blockera Pro by connecting your site to your purchased Pro license.',
					'blockera'
				)}
			</p>
			<Flex direction="column">
				<span className="domain">
					<span>{window.location.protocol + '//'}</span>
					{window.location.hostname}
				</span>
				<Button
					className="activate-call-to-action"
					variant="primary"
					onClick={() => (window.location.href = blockeraActivateUrl)}
				>
					<AttachIcon fill="#fff" />
					{__('Activate License', 'blockera')}
				</Button>
				<p className="how-to">
					{__(
						'Explore our connection tutorial to learn contact support team for help. ',
						'blockera'
					)}
					<a
						href="https://blockera.ai/docs/how-to-connect-blockera-to-your-subscription/"
						target="_blank"
						rel="noopener noreferrer"
					>
						{__('how to activate your license', 'blockera')}
					</a>
					{__(', or ', 'blockera')}
					<a href="mailto:support@blockera.ai">
						{__('contact support team ', 'blockera')}
					</a>
					{__('for help.', 'blockera')}
				</p>
			</Flex>
		</div>
	);
};
