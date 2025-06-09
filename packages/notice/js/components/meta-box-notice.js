// @flow

/**
 * External dependencies
 */
import type { MixedElement } from 'react';

/**
 * Blockera dependencies
 */
import { componentClassNames } from '@blockera/classnames';
import { Icon } from '@blockera/icons';
import { Button } from '@blockera/controls';

/**
 * Internal dependencies
 */
import { useNoticeContext } from '../context/notice-provider';
import { getNoticeIcon, executeNoticeAction } from '../utils';
import type { MetaBoxNoticeProps, NoticeAction } from '../types';

/**
 * Meta Box Notice Component
 */
export default function MetaBoxNotice({
	id,
	type = 'info',
	title,
	message,
	isDismissible = true,
	showIcon = true,
	icon,
	actions = [],
	onDismiss,
	className,
	style,
	metaBoxId,
	position = 'top',
	children,
}: MetaBoxNoticeProps): MixedElement {
	const { dismissNotice } = useNoticeContext();

	/**
	 * Handle dismiss action
	 */
	const handleDismiss = () => {
		if (id) {
			dismissNotice(id);
		}
		if (onDismiss) {
			onDismiss();
		}
	};

	/**
	 * Handle action click
	 */
	const handleActionClick = (action: NoticeAction) => {
		executeNoticeAction(action);
	};

	const noticeClasses = componentClassNames(
		'blockera-meta-box-notice',
		`blockera-meta-box-notice--${type}`,
		`blockera-meta-box-notice--${position}`,
		isDismissible && 'blockera-meta-box-notice--dismissible',
		metaBoxId && `blockera-meta-box-notice--${metaBoxId}`,
		className
	);

	return (
		<div
			className={noticeClasses}
			style={style}
			data-testid="meta-box-notice"
			data-notice-type={type}
			data-meta-box-id={metaBoxId}
		>
			<div className="blockera-meta-box-notice__content">
				{showIcon && (
					<div className="blockera-meta-box-notice__icon">
						{icon || (
							<Icon icon={getNoticeIcon(type)} iconSize="18" />
						)}
					</div>
				)}

				<div className="blockera-meta-box-notice__body">
					{title && (
						<h4 className="blockera-meta-box-notice__title">
							{title}
						</h4>
					)}

					<div className="blockera-meta-box-notice__message">
						{message}
					</div>

					{children && (
						<div className="blockera-meta-box-notice__children">
							{children}
						</div>
					)}

					{actions.length > 0 && (
						<div className="blockera-meta-box-notice__actions">
							{actions.map((action, index) => (
								<Button
									key={index}
									variant={action.variant || 'secondary'}
									size="small"
									className={`blockera-meta-box-notice__action ${
										action.className || ''
									}`}
									onClick={() => handleActionClick(action)}
								>
									{action.label}
								</Button>
							))}
						</div>
					)}
				</div>

				{isDismissible && (
					<button
						type="button"
						className="blockera-meta-box-notice__dismiss"
						onClick={handleDismiss}
						aria-label="Dismiss this notice"
					>
						<Icon icon="dismiss" iconSize="16" />
					</button>
				)}
			</div>
		</div>
	);
}
