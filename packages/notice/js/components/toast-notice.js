// @flow

/**
 * External dependencies
 */
import { useState, useEffect } from '@wordpress/element';
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
import type { ToastNoticeProps, NoticeAction } from '../types';

/**
 * Toast Notice Component
 */
export default function ToastNotice({
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
	position = 'top-right',
	animation = 'slide',
	autoClose = true,
	duration = 5000,
	children,
}: ToastNoticeProps): MixedElement {
	const { dismissNotice } = useNoticeContext();
	const [isVisible, setIsVisible] = useState(false);
	const [isExiting, setIsExiting] = useState(false);

	/**
	 * Handle dismiss action
	 */
	const handleDismiss = () => {
		setIsExiting(true);
		setTimeout(() => {
			if (id) {
				dismissNotice(id);
			}
			if (onDismiss) {
				onDismiss();
			}
		}, 300); // Animation duration
	};

	/**
	 * Handle action click
	 */
	const handleActionClick = (action: NoticeAction) => {
		executeNoticeAction(action);
	};

	/**
	 * Auto-close functionality
	 */
	useEffect(() => {
		// Show animation
		const showTimer = setTimeout(() => {
			setIsVisible(true);
		}, 50);

		// Auto-close timer
		let autoCloseTimer;
		if (autoClose && duration > 0) {
			autoCloseTimer = setTimeout(() => {
				handleDismiss();
			}, duration);
		}

		return () => {
			clearTimeout(showTimer);
			if (autoCloseTimer) {
				clearTimeout(autoCloseTimer);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [autoClose, duration]);

	const noticeClasses = componentClassNames(
		'blockera-toast-notice',
		`blockera-toast-notice--${type}`,
		`blockera-toast-notice--${position}`,
		`blockera-toast-notice--${animation}`,
		isVisible && 'blockera-toast-notice--visible',
		isExiting && 'blockera-toast-notice--exiting',
		isDismissible && 'blockera-toast-notice--dismissible',
		className
	);

	return (
		<div
			className={noticeClasses}
			style={style}
			data-testid="toast-notice"
			data-notice-type={type}
		>
			<div className="blockera-toast-notice__content">
				{showIcon && (
					<div className="blockera-toast-notice__icon">
						{icon || (
							<Icon icon={getNoticeIcon(type)} iconSize="20" />
						)}
					</div>
				)}

				<div className="blockera-toast-notice__body">
					{title && (
						<h4 className="blockera-toast-notice__title">
							{title}
						</h4>
					)}

					<div className="blockera-toast-notice__message">
						{message}
					</div>

					{children && (
						<div className="blockera-toast-notice__children">
							{children}
						</div>
					)}

					{actions.length > 0 && (
						<div className="blockera-toast-notice__actions">
							{actions.map((action, index) => (
								<Button
									key={index}
									variant={action.variant || 'tertiary'}
									size="small"
									className={`blockera-toast-notice__action ${
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
						className="blockera-toast-notice__dismiss"
						onClick={handleDismiss}
						aria-label="Dismiss this notice"
					>
						<Icon icon="dismiss" iconSize="16" />
					</button>
				)}
			</div>

			{/* Progress bar for auto-close */}
			{autoClose && duration > 0 && (
				<div className="blockera-toast-notice__progress">
					<div
						className="blockera-toast-notice__progress-bar"
						style={{
							animationDuration: `${duration}ms`,
						}}
					/>
				</div>
			)}
		</div>
	);
}
