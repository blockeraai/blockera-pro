// @flow

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import type { MixedElement, ComponentType } from 'react';

/**
 * Blockera dependencies
 */
import { Icon } from '@blockera/icons';
import { Flex, Button, Avatar, Promoter } from '@blockera/controls';

export const filterCallToActions = () => {
	addFilter(
		'blockera.admin.dashboard.pro.call.to.actions',
		'blockera.pro.admin.dashboard.pro.call.to.actions',
		(): ComponentType<any> => {
			const FilteredProCallToActionComponent = () => {
				const {
					blockeraPROIsActivated,
					blockeraActivateLicenseUrl,
					blockeraIsConnectedWithYourAccount,
				} = window;

				if (
					!blockeraPROIsActivated &&
					!blockeraIsConnectedWithYourAccount
				) {
					return (
						<Button
							variant="secondary-on-hover"
							icon={
								<Icon
									library={'ui'}
									icon={'crown'}
									iconSize={22}
								/>
							}
							text={__('Activate Pro License', 'blockera')}
							href={blockeraActivateLicenseUrl}
							target="_blank"
						/>
					);
				}

				return <></>;
			};

			return FilteredProCallToActionComponent;
		}
	);
};

export const filterAvailableTabs = (): void => {
	addFilter(
		'blockera.admin.dashboard.tabs',
		'blockera.pro.admin.dashboard.tabs',
		(tabs: Array<Object>): Array<Object> => {
			return [
				...tabs,
				{
					name: 'account',
					settingSlug: 'account',
					className: 'account-settings-tab',
					title: __('Account & License', 'blockera'),
				},
			];
		}
	);
};

export const ProfileComponent = (): MixedElement => {
	const { blockeraAIAccount, blockeraActivateLicenseUrl } = window;

	return (
		<>
			{blockeraAIAccount?.licenses?.length > 0 ? (
				<Flex
					justifyContent="space-between"
					alignItems="center"
					className="profile-container"
					onClick={() =>
						(window.location.href = blockeraActivateLicenseUrl)
					}
				>
					<Flex
						gap="16"
						alignItems="center"
						justifyContent="space-between"
					>
						<Avatar
							src={blockeraAIAccount?.avatar}
							alt={blockeraAIAccount?.name}
							className="account-avatar"
						/>

						<Flex direction="column" gap={4}>
							<h3 style={{ margin: 0 }}>
								{blockeraAIAccount?.name}
							</h3>

							<p style={{ margin: 0 }}>
								{blockeraAIAccount?.email}
							</p>
						</Flex>
					</Flex>
					<Icon icon={'chevron-right'} library="wp" iconSize={22} />
				</Flex>
			) : (
				<Promoter
					heading={__('Activate Blockera Pro', 'blockera')}
					buttonText={__('Activate Pro License', 'blockera')}
					buttonURL={window?.blockeraActivateLicenseUrl}
					buttonTarget="_self"
					disableHintsText={true}
					style={{
						width: '100%',
						boxShadow: 'var(--card-box-shadow)',
						borderRadius: 'var(--card-border-radius)',
						padding: '25px 35px',
						backgroundColor: 'var(--card-bg-color)',
						marginTop: 'auto',
						boxSizing: 'border-box',
					}}
				/>
			)}
		</>
	);
};

export const filteredDashboardProfileComponent = (): void => {
	addFilter(
		'blockera.admin.dashboard.profile.component',
		'blockera.pro.admin.dashboard.profile.component',
		ProfileComponent
	);
};

export const filteredDashboardAvailablePages = (): void => {
	addFilter(
		'blockera.admin.dashboard.availablePages',
		'blockera.pro.admin.dashboard.availablePages',
		(pages: Array<string>): Array<string> => [...pages, 'account']
	);
};
