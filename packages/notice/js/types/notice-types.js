// @flow

/**
 * Notice Types
 */
export type NoticeType =
	'success' | 'error' | 'warning' | 'info' | 'information';

/**
 * Notice Context Types
 */
export type NoticeContext =
	| 'admin'
	| 'inline'
	| 'toast'
	| 'snackbar'
	| 'meta-box'
	| 'bulk-action'
	| 'global';

/**
 * Notice Status Types for WordPress API
 */
export type NoticeStatus = 'publish' | 'draft' | 'private' | 'trash';

/**
 * Base Notice Configuration
 */
export type NoticeConfig = {
	id?: string,
	type: NoticeType,
	context: NoticeContext,
	title?: string,
	message: string,
	isDismissible?: boolean,
	showIcon?: boolean,
	icon?: any,
	autoClose?: boolean,
	duration?: number,
	persistent?: boolean,
	actions?: Array<NoticeAction>,
	onDismiss?: () => void,
	onShow?: () => void,
	className?: string,
	style?: Object,
};

/**
 * Notice Action Configuration
 */
export type NoticeAction = {
	label: string,
	url?: string,
	onClick?: () => void,
	variant?: 'primary' | 'secondary' | 'tertiary' | 'link',
	className?: string,
};

/**
 * WordPress Notice Data
 */
export type WordPressNotice = {
	id: string,
	title: string,
	content: string,
	status: NoticeStatus,
	type: NoticeType,
	date: string,
	modified: string,
	author: number,
	meta: {
		context?: NoticeContext,
		dismissible?: boolean,
		persistent?: boolean,
		target_users?: Array<number>,
		target_roles?: Array<string>,
		expiry_date?: string,
	},
};

/**
 * Notice Store State
 */
export type NoticeState = {
	notices: Array<NoticeConfig>,
	dismissedNotices: Array<string>,
	isLoading: boolean,
	error: ?string,
};
