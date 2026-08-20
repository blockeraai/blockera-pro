// @flow

/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { addAction, doAction } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import type { WordPressNotice, NoticeConfig } from '../types';
import { API_ENDPOINTS, WP_HOOKS, WordPressNoticeClasses } from '../constants';

/**
 * Fetch notices from WordPress REST API
 */
export async function fetchWordPressNotices(): Promise<Array<WordPressNotice>> {
	try {
		const notices = await apiFetch({
			path: API_ENDPOINTS.NOTICES,
			method: 'GET',
		});
		return notices || [];
	} catch (error) {
		//@debug-ignore
		console.error('Failed to fetch WordPress notices:', error);
		return [];
	}
}

/**
 * Create notice via WordPress REST API
 */
export async function createWordPressNotice(
	notice: Partial<WordPressNotice>
): Promise<?WordPressNotice> {
	try {
		const createdNotice = await apiFetch({
			path: API_ENDPOINTS.NOTICES,
			method: 'POST',
			data: notice,
		});
		return createdNotice;
	} catch (error) {
		//@debug-ignore
		console.error('Failed to create WordPress notice:', error);
		return null;
	}
}

/**
 * Update notice via WordPress REST API
 */
export async function updateWordPressNotice(
	id: string,
	updates: Partial<WordPressNotice>
): Promise<?WordPressNotice> {
	try {
		const updatedNotice = await apiFetch({
			path: `${API_ENDPOINTS.NOTICES}/${id}`,
			method: 'POST',
			data: updates,
		});
		return updatedNotice;
	} catch (error) {
		//@debug-ignore
		console.error('Failed to update WordPress notice:', error);
		return null;
	}
}

/**
 * Delete notice via WordPress REST API
 */
export async function deleteWordPressNotice(id: string): Promise<boolean> {
	try {
		await apiFetch({
			path: `${API_ENDPOINTS.NOTICES}/${id}`,
			method: 'DELETE',
		});
		return true;
	} catch (error) {
		//@debug-ignore
		console.error('Failed to delete WordPress notice:', error);
		return false;
	}
}

/**
 * Convert WordPress notice to NoticeConfig
 */
export function convertWordPressNotice(
	wpNotice: WordPressNotice
): NoticeConfig {
	return {
		id: wpNotice.id,
		type: wpNotice.type,
		context: wpNotice.meta.context || 'admin',
		title: wpNotice.title,
		message: wpNotice.content,
		isDismissible: wpNotice.meta.dismissible !== false,
		persistent: wpNotice.meta.persistent || false,
		showIcon: true,
	};
}

/**
 * Convert NoticeConfig to WordPress notice format
 */
export function convertToWordPressNotice(
	notice: NoticeConfig
): Partial<WordPressNotice> {
	return {
		title: notice.title || '',
		content: notice.message,
		status: 'publish',
		type: notice.type,
		meta: {
			context: notice.context,
			dismissible: notice.isDismissible,
			persistent: notice.persistent,
		},
	};
}

/**
 * Get WordPress admin notice classes
 */
export function getWordPressNoticeClasses(
	type: string,
	isDismissible?: boolean
): string {
	const classes = ['notice'];

	switch (type) {
		case 'success':
			classes.push(WordPressNoticeClasses.SUCCESS);
			break;
		case 'error':
			classes.push(WordPressNoticeClasses.ERROR);
			break;
		case 'warning':
			classes.push(WordPressNoticeClasses.WARNING);
			break;
		case 'info':
		case 'information':
			classes.push(WordPressNoticeClasses.INFO);
			break;
	}

	if (isDismissible) {
		classes.push(WordPressNoticeClasses.DISMISSIBLE);
	}

	return classes.join(' ');
}

/**
 * Add WordPress admin notice via hooks
 */
export function addWordPressAdminNotice(notice: NoticeConfig): void {
	addAction(WP_HOOKS.ADMIN_NOTICES, 'blockera/notice', () => {
		doAction('blockera/render_admin_notice', notice);
	});
}

/**
 * Store dismissed notice in user meta
 */
export async function storeDismissedNotice(noticeId: string): Promise<boolean> {
	try {
		const currentMeta = await apiFetch({
			path: API_ENDPOINTS.USER_META,
			method: 'GET',
		});

		const dismissedNotices = currentMeta.dismissed_notices || [];
		if (!dismissedNotices.includes(noticeId)) {
			dismissedNotices.push(noticeId);

			await apiFetch({
				path: API_ENDPOINTS.USER_META,
				method: 'POST',
				data: {
					dismissed_notices: dismissedNotices,
				},
			});
		}

		return true;
	} catch (error) {
		//@debug-ignore
		console.error('Failed to store dismissed notice:', error);
		return false;
	}
}

/**
 * Get dismissed notices from user meta
 */
export async function getDismissedNotices(): Promise<Array<string>> {
	try {
		const userMeta = await apiFetch({
			path: API_ENDPOINTS.USER_META,
			method: 'GET',
		});

		return userMeta.dismissed_notices || [];
	} catch (error) {
		//@debug-ignore
		console.error('Failed to get dismissed notices:', error);
		return [];
	}
}
