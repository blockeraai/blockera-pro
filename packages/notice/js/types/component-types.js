// @flow

/**
 * Internal dependencies
 */
import type { NoticeConfig } from './notice-types';

/**
 * Base Notice Component Props
 */
export type BaseNoticeProps = {
	...NoticeConfig,
	children?: any,
};

/**
 * Admin Notice Props
 */
export type AdminNoticeProps = {
	...BaseNoticeProps,
	isAlternative?: boolean,
	isLarge?: boolean,
};

/**
 * Toast Notice Props
 */
export type ToastNoticeProps = {
	...BaseNoticeProps,
	/* eslint-disable */
	position?:
		| 'top-right'
		| 'top-left'
		| 'bottom-right'
		| 'bottom-left'
		| 'top-center'
		| 'bottom-center',
	animation?: 'slide' | 'fade' | 'bounce',
	/* eslint-enable */
};

/**
 * Snackbar Notice Props
 */
export type SnackbarNoticeProps = {
	...BaseNoticeProps,
	position?: 'bottom' | 'top',
	maxWidth?: number,
};

/**
 * Inline Notice Props
 */
export type InlineNoticeProps = {
	...BaseNoticeProps,
	compact?: boolean,
	bordered?: boolean,
};

/**
 * Dismissible Notice Props
 */
export type DismissibleNoticeProps = {
	...BaseNoticeProps,
	dismissText?: string,
	showDismissIcon?: boolean,
};

/**
 * Bulk Notice Props
 */
export type BulkNoticeProps = {
	...BaseNoticeProps,
	notices: Array<NoticeConfig>,
	groupBy?: 'type' | 'context',
	maxVisible?: number,
	showCount?: boolean,
};

/**
 * Meta Box Notice Props
 */
export type MetaBoxNoticeProps = {
	...BaseNoticeProps,
	metaBoxId?: string,
	position?: 'top' | 'bottom',
};

/**
 * Notice Container Props
 */
export type NoticeContainerProps = {
	context?: string,
	className?: string,
	style?: Object,
	maxNotices?: number,
	position?: 'fixed' | 'relative' | 'absolute',
	children?: any,
};
