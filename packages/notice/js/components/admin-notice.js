// @flow

/**
 * External dependencies
 */
import { type MixedElement } from 'react';

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
import {
	getNoticeIcon,
	getWordPressNoticeClasses,
	executeNoticeAction,
} from '../utils';
import type { AdminNoticeProps, NoticeAction } from '../types';

/**
 * Admin Notice Component
 */
export default function AdminNotice({
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
	isAlternative = false,
	isLarge = false,
	children,
}: AdminNoticeProps): MixedElement {
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
		'blockera-admin-notice',
		getWordPressNoticeClasses(type, isDismissible),
		isAlternative && 'notice-alt',
		isLarge && 'notice-large',
		className
	);

	return (
		<div
			className={noticeClasses}
			style={style}
			data-testid="admin-notice"
			data-notice-type={type}
		>
			<div className="blockera-admin-notice__content">
				{showIcon && (
					<div className="blockera-admin-notice__icon">
						{icon || (
							<Icon icon={getNoticeIcon(type)} iconSize="20" />
						)}
					</div>
				)}

				<div className="blockera-admin-notice__body">
					{title && (
						<h3 className="blockera-admin-notice__title">
							{title}
						</h3>
					)}

					<div className="blockera-admin-notice__message">
						{message}
					</div>

					{children && (
						<div className="blockera-admin-notice__children">
							{children}
						</div>
					)}

					{actions.length > 0 && (
						<div className="blockera-admin-notice__actions">
							{actions.map((action, index) => (
								<Button
									key={index}
									variant={action.variant || 'secondary'}
									size="small"
									className={`blockera-admin-notice__action ${
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
						className="notice-dismiss"
						onClick={handleDismiss}
						aria-label="Dismiss this notice"
					>
						<span className="screen-reader-text">
							Dismiss this notice.
						</span>
					</button>
				)}
			</div>
		</div>
	);
}
