// @flow

/**
 * External dependencies
 */
import { type MixedElement } from 'react';
import { useState } from '@wordpress/element';

/**
 * Blockera dependencies
 */
import { componentClassNames } from '@blockera/classnames';
import { Icon } from '@blockera/icons';

/**
 * Internal dependencies
 */
import { useNoticeContext } from '../context/notice-provider';
import type { DismissibleNoticeProps } from '../types';

/**
 * Dismissible Notice Component
 */
export default function DismissibleNotice({
	id,
	type = 'info',
	// title,
	// message,
	isDismissible = true,
	// showIcon = true,
	// icon,
	onDismiss,
	className,
	style,
	dismissText = 'Dismiss',
	showDismissIcon = true,
	children,
}: DismissibleNoticeProps): MixedElement {
	const { dismissNotice } = useNoticeContext();
	const [isVisible, setIsVisible] = useState(true);

	/**
	 * Handle dismiss action
	 */
	const handleDismiss = () => {
		setIsVisible(false);
		if (id) {
			dismissNotice(id);
		}
		if (onDismiss) {
			onDismiss();
		}
	};

	if (!isVisible) {
		return <></>;
	}

	const noticeClasses = componentClassNames(
		'blockera-dismissible-notice',
		`blockera-dismissible-notice--${type}`,
		className
	);

	return (
		<div
			className={noticeClasses}
			style={style}
			data-testid="dismissible-notice"
			data-notice-type={type}
		>
			<div className="blockera-dismissible-notice__content">
				{children}

				{isDismissible && (
					<div className="blockera-dismissible-notice__dismiss-area">
						<button
							type="button"
							className="blockera-dismissible-notice__dismiss"
							onClick={handleDismiss}
							aria-label={dismissText}
						>
							{showDismissIcon && (
								<Icon icon="dismiss" iconSize="16" />
							)}
							{dismissText && (
								<span className="blockera-dismissible-notice__dismiss-text">
									{dismissText}
								</span>
							)}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
