// @flow

/**
 * Notice Types
 */
export const NoticeTypes = {
	SUCCESS: 'success',
	ERROR: 'error',
	WARNING: 'warning',
	INFO: 'info',
	INFORMATION: 'information',
};

/**
 * Notice Contexts - Different areas where notices can be displayed
 */
export const NoticeContexts = {
	ADMIN: 'admin',
	INLINE: 'inline',
	TOAST: 'toast',
	SNACKBAR: 'snackbar',
	META_BOX: 'meta-box',
	BULK_ACTION: 'bulk-action',
	GLOBAL: 'global',
};

/**
 * Notice Status for WordPress REST API
 */
export const NoticeStatuses = {
	PUBLISHED: 'publish',
	DRAFT: 'draft',
	PRIVATE: 'private',
	TRASH: 'trash',
};

/**
 * WordPress Admin Notice Classes
 */
export const WordPressNoticeClasses = {
	SUCCESS: 'notice-success',
	ERROR: 'notice-error',
	WARNING: 'notice-warning',
	INFO: 'notice-info',
	DISMISSIBLE: 'is-dismissible',
	ALTERNATIVE: 'notice-alt',
	LARGE: 'notice-large',
};

/**
 * Default Notice Configuration
 */
export const DEFAULT_NOTICE_CONFIG = {
	type: NoticeTypes.INFO,
	context: NoticeContexts.ADMIN,
	isDismissible: true,
	showIcon: true,
	autoClose: false,
	duration: 5000,
	persistent: false,
};

/**
 * WordPress Hook Names
 */
export const WP_HOOKS = {
	ADMIN_NOTICES: 'admin_notices',
	ALL_ADMIN_NOTICES: 'all_admin_notices',
	USER_ADMIN_NOTICES: 'user_admin_notices',
	NETWORK_ADMIN_NOTICES: 'network_admin_notices',
};

/**
 * REST API Endpoints
 */
export const API_ENDPOINTS = {
	NOTICES: '/wp/v2/notices',
	USER_META: '/wp/v2/users/me/meta',
	OPTIONS: '/wp/v2/settings',
};
