// @flow

/**
 * External dependencies
 */
import { useState } from '@wordpress/element';
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
import { sortNoticesByPriority } from '../utils';
import AdminNotice from './admin-notice';
import type { BulkNoticeProps } from '../types';

/**
 * Bulk Notice Component
 */
export default function BulkNotice({
	id,
	type = 'info',
	title,
	message,
	notices = [],
	// groupBy = 'type',
	maxVisible = 3,
	showCount = true,
	isDismissible = true,
	onDismiss,
	className,
	style,
	children,
}: BulkNoticeProps): MixedElement {
	const { dismissNotice } = useNoticeContext(); // clearNotices
	const [isExpanded, setIsExpanded] = useState(false);

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
	 * Handle dismiss all
	 */
	const handleDismissAll = () => {
		notices.forEach((notice) => {
			if (notice.id) {
				dismissNotice(notice.id);
			}
		});
	};

	/**
	 * Toggle expanded view
	 */
	const toggleExpanded = () => {
		setIsExpanded(!isExpanded);
	};

	// Group notices if specified
	// const groupedNotices =
	// 	groupBy === 'type' ? groupNoticesByType(notices) : { all: notices };
	const sortedNotices = sortNoticesByPriority(notices);
	const visibleNotices = isExpanded
		? sortedNotices
		: sortedNotices.slice(0, maxVisible);
	const hiddenCount = sortedNotices.length - maxVisible;

	const noticeClasses = componentClassNames(
		'blockera-bulk-notice',
		`blockera-bulk-notice--${type}`,
		isExpanded && 'blockera-bulk-notice--expanded',
		className
	);

	return (
		<div
			className={noticeClasses}
			style={style}
			data-testid="bulk-notice"
			data-notice-type={type}
		>
			<div className="blockera-bulk-notice__header">
				<div className="blockera-bulk-notice__title">
					{title || `${sortedNotices.length} Notices`}
					{showCount && (
						<span className="blockera-bulk-notice__count">
							({sortedNotices.length})
						</span>
					)}
				</div>

				<div className="blockera-bulk-notice__actions">
					{hiddenCount > 0 && (
						<Button
							variant="link"
							size="small"
							onClick={toggleExpanded}
							className="blockera-bulk-notice__toggle"
						>
							{isExpanded
								? 'Show Less'
								: `Show ${hiddenCount} More`}
							<Icon
								icon={
									isExpanded ? 'chevron-up' : 'chevron-down'
								}
								iconSize="14"
							/>
						</Button>
					)}

					<Button
						variant="link"
						size="small"
						onClick={handleDismissAll}
						className="blockera-bulk-notice__dismiss-all"
					>
						Dismiss All
					</Button>

					{isDismissible && (
						<button
							type="button"
							className="blockera-bulk-notice__dismiss"
							onClick={handleDismiss}
							aria-label="Dismiss bulk notice"
						>
							<Icon icon="dismiss" iconSize="16" />
						</button>
					)}
				</div>
			</div>

			<div className="blockera-bulk-notice__content">
				{message && (
					<div className="blockera-bulk-notice__message">
						{message}
					</div>
				)}

				{children && (
					<div className="blockera-bulk-notice__children">
						{children}
					</div>
				)}

				<div className="blockera-bulk-notice__notices">
					{visibleNotices.map((notice, index) => (
						<div
							key={notice.id || index}
							className="blockera-bulk-notice__notice-item"
						>
							<AdminNotice
								{...notice}
								isDismissible={false}
								className="blockera-bulk-notice__notice"
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
