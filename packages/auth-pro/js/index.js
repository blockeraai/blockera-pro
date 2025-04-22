// @flow

/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import type { MixedElement } from 'react';
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';

/**
 * Blockera dependencies
 */
import { Button, Flex, DynamicHtmlFormatter } from '@blockera/controls';
import { Icon } from '@blockera/icons';

/**
 * Internal dependencies
 */
import { Licenses } from './licenses';
import { fireConfettiBomb } from './confetti-bomb';

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

	const [isActivatingBusy, setIsActivatingBusy] = useState(false);

	// TODO add error handling and Interface to show it + doc to contact support
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
			<Flex
				justifyContent="center"
				gap={25}
				className="blockera-auth-container"
				direction="column"
			>
				<h1 className="blockera-auth-congratulations">
					{__('🎉 Congratulations!', 'blockera')}
					<span style={{ display: 'block' }}>
						{__(
							'Your Blockera Pro license is activated.',
							'blockera'
						)}
					</span>
				</h1>

				<Flex justifyContent="center" gap={10} direction="column">
					<p>
						{__(
							'Blockera Pro is successfully connected to your site!',
							'blockera'
						)}
					</p>

					<p>
						{__(
							"You're all set to unlock the full potential of advanced design tools and features.",
							'blockera'
						)}
					</p>
				</Flex>

				<Flex justifyContent="center" gap={20}>
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
			</Flex>
		);
	}

	if (blockeraAIAccount?.licenses?.length) {
		return <Licenses accountInfo={blockeraAIAccount} />;
	}

	return (
		<Flex className="blockera-auth-container" gap={12} direction="column">
			<h1 className="title">
				{__('Connect your site to your Pro license', 'blockera')}
			</h1>

			<p className="description">
				{__(
					'Activate the Blockera Pro by connecting your site to your purchased Pro license.',
					'blockera'
				)}
			</p>

			<Flex direction="column" alignItems="center" gap={12}>
				<span className="domain">
					<span>{window.location.protocol + '//'}</span>
					{window.location.hostname}
				</span>

				<Flex
					className="site-domain-wrapper"
					direction="column"
					alignItems="center"
					gap={4}
				>
					<div className="dashed-line" />
					<Icon library="ui" icon="link" iconSize={24} />
				</Flex>

				<Button
					className="activate-call-to-action"
					variant="primary"
					onClick={() => {
						setIsActivatingBusy(true);
						window.location.href = blockeraActivateUrl;
					}}
					isBusy={isActivatingBusy}
				>
					<Icon library="ui" icon="unlock" iconSize={24} />

					{__('Activate License', 'blockera')}
				</Button>

				<p className="how-to">
					<DynamicHtmlFormatter
						text={sprintf(
							/* translators: %1$s is a link to the connection tutorial, %2$s is a link to the contact support team. */
							__(
								'Explore our connection tutorial to learn %1$s, or %2$s for help.',
								'blockera'
							),
							'{how-to}',
							'{contact-support}'
						)}
						replacements={{
							'how-to': (
								<a
									href="https://blockera.ai/docs/how-to-connect-blockera-to-your-subscription/"
									target="_blank"
									rel="noopener noreferrer"
								>
									{
										/* translators: This is a link to the connection tutorial. */
										__(
											'how to activate your license',
											'blockera'
										)
									}
								</a>
							),
							'contact-support': (
								<a href="mailto:support@blockera.ai">
									{
										/* translators: This is a link to the contact support team. */
										__('contact support team', 'blockera')
									}
								</a>
							),
						}}
					/>
				</p>
			</Flex>
		</Flex>
	);
};
