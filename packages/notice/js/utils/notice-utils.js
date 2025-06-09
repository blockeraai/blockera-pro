// @flow

/**
 * Blockera dependencies
 */
import { isFunction, isString } from '@blockera/utils';

/**
 * Internal dependencies
 */
import type { NoticeConfig, NoticeType } from '../types';
import { NoticeTypes, DEFAULT_NOTICE_CONFIG } from '../constants';

/**
 * Generate unique notice ID
 */
export function generateNoticeId(): string {
	return `notice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create notice configuration with defaults
 */
export function createNoticeConfig(
	config: Partial<NoticeConfig>
): NoticeConfig {
	return {
		...DEFAULT_NOTICE_CONFIG,
		...config,
		id: config.id || generateNoticeId(),
	};
}

/**
 * Validate notice configuration
 */
export function validateNoticeConfig(config: NoticeConfig): boolean {
	if (!config.message || !isString(config.message)) {
		return false;
	}

	if (!Object.values(NoticeTypes).includes(config.type)) {
		return false;
	}

	return true;
}

/**
 * Get notice icon based on type
 */
export function getNoticeIcon(type: NoticeType): string {
	switch (type) {
		case NoticeTypes.SUCCESS:
			return 'success';
		case NoticeTypes.ERROR:
			return 'error';
		case NoticeTypes.WARNING:
			return 'warning';
		case NoticeTypes.INFO:
		case NoticeTypes.INFORMATION:
			return 'information';
		default:
			return 'information';
	}
}

/**
 * Get notice CSS classes
 */
export function getNoticeClasses(
	config: NoticeConfig,
	additionalClasses?: string
): string {
	const classes = [
		'blockera-notice',
		`blockera-notice--${config.type}`,
		`blockera-notice--${config.context}`,
	];

	if (config.isDismissible) {
		classes.push('blockera-notice--dismissible');
	}

	if (config.showIcon) {
		classes.push('blockera-notice--with-icon');
	}

	if (config.className) {
		classes.push(config.className);
	}

	if (additionalClasses) {
		classes.push(additionalClasses);
	}

	return classes.join(' ');
}

/**
 * Filter notices by context
 */
export function filterNoticesByContext(
	notices: Array<NoticeConfig>,
	context: string
): Array<NoticeConfig> {
	return notices.filter((notice) => notice.context === context);
}

/**
 * Group notices by type
 */
export function groupNoticesByType(notices: Array<NoticeConfig>): {
	[NoticeType]: Array<NoticeConfig>,
} {
	return notices.reduce((groups, notice) => {
		const type = notice.type;
		if (!groups[type]) {
			groups[type] = [];
		}
		groups[type].push(notice);
		return groups;
	}, {});
}

/**
 * Sort notices by priority (error > warning > info > success)
 */
export function sortNoticesByPriority(
	notices: Array<NoticeConfig>
): Array<NoticeConfig> {
	const priority = {
		[NoticeTypes.ERROR]: 1,
		[NoticeTypes.WARNING]: 2,
		[NoticeTypes.INFO]: 3,
		[NoticeTypes.INFORMATION]: 3,
		[NoticeTypes.SUCCESS]: 4,
	};

	return [...notices].sort((a, b) => {
		return (priority[a.type] || 5) - (priority[b.type] || 5);
	});
}

/**
 * Execute notice action
 */
export function executeNoticeAction(action: any): void {
	if (action.url && isString(action.url)) {
		window.open(action.url, '_blank');
	} else if (action.onClick && isFunction(action.onClick)) {
		action.onClick();
	}
}
