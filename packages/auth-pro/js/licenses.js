// @flow

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import type { MixedElement } from 'react';

/**
 * Blockera dependencies
 */
import { classNames, componentInnerClassNames } from '@blockera/classnames';
import {
	Flex,
	Image,
	Avatar,
	Button,
	LoadingComponent,
} from '@blockera/controls';
import { Icon } from '@blockera/icons';

const License = ({
	name,
	isActive,
	thumbnail,
	isExpired,
}: {
	name: string,
	thumbnail: string,
	isActive: boolean,
	isExpired: boolean,
}): MixedElement => {
	const Renew = (): MixedElement => (
		<Flex
			className={classNames('blockera-subscription-actions')}
			justifyContent="flex-start"
			gap={30}
		>
			<Button
				variant="primary"
				href={'https://blockera.ai/my-account/my-subscription/'}
				size="small"
			>
				{__('Renew License', 'blockera')}
			</Button>
		</Flex>
	);

	const splitName = name.split(' - ');
	const productName = splitName[1];
	const plan = [splitName[2], splitName[3]].join(' - ');

	return (
		<div className="license-box-wrapper">
			<Flex
				className="license-card-separator product-header"
				alignItems="center"
				justifyContent="space-between"
			>
				<Flex
					alignItems="center"
					className={componentInnerClassNames('license', {
						active: isActive,
						'is-expired-license': isExpired,
					})}
					gap={20}
				>
					<Image
						src={thumbnail}
						alt={name}
						className="product-logo"
					/>

					<Flex direction="column" gap={12} grow={1}>
						<h3 className="product-title">{productName}</h3>

						<Flex
							className="product-details"
							gap={40}
							direction="row"
						>
							<p style={{ margin: 0 }}>{plan}</p>

							{isExpired && (
								<p
									style={{
										margin: 0,
										color: '#e60000',
										fontWeight: 500,
									}}
								>
									{__('License Expired!', 'blockera')}
								</p>
							)}
						</Flex>
					</Flex>

					{!isExpired && (
						<div className="product-status status-active">
							<Icon icon={'check'} />
							{__('Active License', 'blockera')}
						</div>
					)}

					{(isExpired || !isActive) && <Renew />}
				</Flex>
			</Flex>
		</div>
	);
};

export const Licenses = ({
	accountInfo: { name, email, avatar, licenses },
}: {
	accountInfo: {
		licenses: Array<{
			name: string,
			status: string,
			startDate: string,
			licenseKey: string,
			nextPaymentDueDate: string,
		}>,
		product_id: string,
		name: string,
		email: string,
		avatar: string,
	},
}): MixedElement => {
	if (!name || !licenses.length) {
		return (
			<LoadingComponent
				loadingDescription={__('Connecting …', 'blockera')}
			/>
		);
	}

	return (
		<Flex
			direction="column"
			gap={50}
			className={componentInnerClassNames('blockera-license-container')}
		>
			<Flex direction="column" gap={20}>
				<h6 className="blockera-licenses-subtitle">
					{__('Your Blockera Account', 'blockera')}
				</h6>

				<Flex alignItems="center" className="account-info" gap={20}>
					<Avatar
						src={avatar}
						alt={name}
						className="account-avatar"
					/>

					<Flex direction="column" gap={12} grow={1}>
						<h3 style={{ margin: 0 }}>{name}</h3>

						<p style={{ margin: 0 }}>{email}</p>
					</Flex>

					<Flex gap={16} alignItems="center">
						<Button
							size="small"
							variant="secondary"
							href={
								'https://blockera.ai/my-account/my-subscription/'
							}
						>
							<Icon library={'wp'} icon={'key'} iconSize={20} />
							{__('Manage Licenses', 'blockera')}
						</Button>

						<Button
							size="small"
							variant="primary"
							href={'https://blockera.ai/my-account/'}
						>
							<Icon
								library={'wp'}
								icon={'comment-author-avatar'}
								iconSize={20}
							/>
							{__('Manage Account', 'blockera')}
						</Button>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap={20}>
				<h6 className="blockera-licenses-subtitle">
					{__('Your Blockera Licenses', 'blockera')}
				</h6>

				{licenses.map(
					(
						{
							name,
							status,
							thumbnail,
							endDate,
							nextPaymentDueDate,
						}: Object,
						index: number
					) => {
						const isActive = status === 'active';
						const isExpired =
							(!endDate
								? new Date(nextPaymentDueDate)
								: new Date(endDate)) < new Date();

						return (
							<License
								key={index + name}
								{...{
									name,
									isActive: isActive && !isExpired,
									isExpired,
									thumbnail,
								}}
							/>
						);
					}
				)}
			</Flex>
		</Flex>
	);
};
