// @flow

/**
 * External dependencies
 */
import type { MixedElement } from 'react';

/**
 * Blockera dependencies
 */
import { componentClassNames } from '@blockera/classnames';

/**
 * Internal dependencies
 */
import { useNoticeContext } from '../context/notice-provider';
import { sortNoticesByPriority } from '../utils';
import AdminNotice from './admin-notice';
import InlineNotice from './inline-notice';
import ToastNotice from './toast-notice';
import SnackbarNotice from './snackbar-notice';
import MetaBoxNotice from './meta-box-notice';
import type { NoticeContainerProps } from '../types';

/**
 * Notice Container Component
 */
export default function NoticeContainer({
	context = 'admin',
	className,
	style,
	maxNotices = 10,
	position = 'relative',
	children,
}: NoticeContainerProps): MixedElement {
	const { getNoticesByContext } = useNoticeContext();

	// Get notices for this context
	const contextNotices = getNoticesByContext(context);

	// Sort by priority and limit
	const sortedNotices = sortNoticesByPriority(contextNotices).slice(
		0,
		maxNotices
	);

	/**
	 * Render notice based on context
	 */
	const renderNotice = (notice: any) => {
		switch (notice.context) {
			case 'admin':
				return <AdminNotice key={notice.id} {...notice} />;
			case 'inline':
				return <InlineNotice key={notice.id} {...notice} />;
			case 'toast':
				return <ToastNotice key={notice.id} {...notice} />;
			case 'snackbar':
				return <SnackbarNotice key={notice.id} {...notice} />;
			case 'meta-box':
				return <MetaBoxNotice key={notice.id} {...notice} />;
			default:
				return <AdminNotice key={notice.id} {...notice} />;
		}
	};

	if (sortedNotices.length === 0 && !children) {
		return <></>;
	}

	return (
		<div
			className={componentClassNames(
				'notice-container',
				`notice-container--${context}`,
				`notice-container--${position}`,
				className
			)}
			style={style}
			data-testid="notice-container"
		>
			{sortedNotices.map(renderNotice)}
			{children}
		</div>
	);
}
