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
import type { InlineNoticeProps, NoticeAction } from '../types';

/**
 * Inline Notice Component
 */
export default function InlineNotice({
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
	compact = false,
	bordered = true,
	children,
}: InlineNoticeProps): MixedElement {
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
		'blockera-inline-notice',
		`blockera-inline-notice--${type}`,
		compact && 'blockera-inline-notice--compact',
		bordered && 'blockera-inline-notice--bordered',
		isDismissible && 'blockera-inline-notice--dismissible',
		className
	);

	return (
		<div
			className={noticeClasses}
			style={style}
			data-testid="inline-notice"
			data-notice-type={type}
		>
			<div className="blockera-inline-notice__content">
				{showIcon && (
					<div className="blockera-inline-notice__icon">
						{icon || (
							<Icon
								icon={getNoticeIcon(type)}
								iconSize={compact ? '16' : '18'}
							/>
						)}
					</div>
				)}

				<div className="blockera-inline-notice__body">
					{title && !compact && (
						<h4 className="blockera-inline-notice__title">
							{title}
						</h4>
					)}

					<div className="blockera-inline-notice__message">
						{message}
					</div>

					{children && (
						<div className="blockera-inline-notice__children">
							{children}
						</div>
					)}

					{actions.length > 0 && (
						<div className="blockera-inline-notice__actions">
							{actions.map((action, index) => (
								<Button
									key={index}
									variant={action.variant || 'link'}
									size={compact ? 'small' : 'normal'}
									className={`blockera-inline-notice__action ${
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
						className="blockera-inline-notice__dismiss"
						onClick={handleDismiss}
						aria-label="Dismiss this notice"
					>
						<Icon icon="dismiss" iconSize={compact ? '14' : '16'} />
					</button>
				)}
			</div>
		</div>
	);
}
