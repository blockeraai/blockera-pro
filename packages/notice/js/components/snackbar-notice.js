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
import type { SnackbarNoticeProps, NoticeAction } from '../types';

/**
 * Snackbar Notice Component
 */
export default function SnackbarNotice({
	id,
	type = 'info',
	// title,
	message,
	isDismissible = true,
	showIcon = true,
	icon,
	actions = [],
	onDismiss,
	className,
	style,
	position = 'bottom',
	maxWidth = 400,
	autoClose = true,
	duration = 4000,
	children,
}: SnackbarNoticeProps): MixedElement {
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
		}, 250);
	};

	/**
	 * Handle action click
	 */
	const handleActionClick = (action: NoticeAction) => {
		executeNoticeAction(action);
	};

	/**
	 * Auto-close and animation
	 */
	useEffect(() => {
		const showTimer = setTimeout(() => {
			setIsVisible(true);
		}, 50);

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
		'blockera-snackbar-notice',
		`blockera-snackbar-notice--${type}`,
		`blockera-snackbar-notice--${position}`,
		isVisible && 'blockera-snackbar-notice--visible',
		isExiting && 'blockera-snackbar-notice--exiting',
		className
	);

	const noticeStyle = {
		maxWidth: `${maxWidth}px`,
		...style,
	};

	return (
		<div
			className={noticeClasses}
			style={noticeStyle}
			data-testid="snackbar-notice"
			data-notice-type={type}
		>
			<div className="blockera-snackbar-notice__content">
				{showIcon && (
					<div className="blockera-snackbar-notice__icon">
						{icon || (
							<Icon icon={getNoticeIcon(type)} iconSize="18" />
						)}
					</div>
				)}

				<div className="blockera-snackbar-notice__body">
					<div className="blockera-snackbar-notice__message">
						{message}
					</div>

					{children && (
						<div className="blockera-snackbar-notice__children">
							{children}
						</div>
					)}
				</div>

				{actions.length > 0 && (
					<div className="blockera-snackbar-notice__actions">
						{actions.map((action, index) => (
							<Button
								key={index}
								variant="link"
								size="small"
								className={`blockera-snackbar-notice__action ${
									action.className || ''
								}`}
								onClick={() => handleActionClick(action)}
							>
								{action.label}
							</Button>
						))}
					</div>
				)}

				{isDismissible && (
					<button
						type="button"
						className="blockera-snackbar-notice__dismiss"
						onClick={handleDismiss}
						aria-label="Dismiss this notice"
					>
						<Icon icon="dismiss" iconSize="14" />
					</button>
				)}
			</div>
		</div>
	);
}
