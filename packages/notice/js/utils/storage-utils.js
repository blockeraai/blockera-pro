// @flow

/**
 * Default storage key for dismissed notices
 */
const DEFAULT_STORAGE_KEY = 'blockera_dismissed_notices';

/**
 * Store dismissed notice IDs in localStorage
 */
export function storeDismissedNotices(
	noticeIds: Array<string>,
	storageKey?: string
): void {
	try {
		const key = storageKey || DEFAULT_STORAGE_KEY;
		localStorage.setItem(key, JSON.stringify(noticeIds));
	} catch (error) {
		console.error('Failed to store dismissed notices:', error);
	}
}

/**
 * Get dismissed notice IDs from localStorage
 */
export function getDismissedNoticesFromStorage(
	storageKey?: string
): Array<string> {
	try {
		const key = storageKey || DEFAULT_STORAGE_KEY;
		const stored = localStorage.getItem(key);
		return stored ? JSON.parse(stored) : [];
	} catch (error) {
		console.error('Failed to get dismissed notices from storage:', error);
		return [];
	}
}

/**
 * Add a notice ID to dismissed notices in localStorage
 */
export function addDismissedNotice(
	noticeId: string,
	storageKey?: string
): void {
	const dismissedNotices = getDismissedNoticesFromStorage(storageKey);
	if (!dismissedNotices.includes(noticeId)) {
		dismissedNotices.push(noticeId);
		storeDismissedNotices(dismissedNotices, storageKey);
	}
}

/**
 * Remove a notice ID from dismissed notices in localStorage
 */
export function removeDismissedNotice(
	noticeId: string,
	storageKey?: string
): void {
	const dismissedNotices = getDismissedNoticesFromStorage(storageKey);
	const filteredNotices = dismissedNotices.filter((id) => id !== noticeId);
	storeDismissedNotices(filteredNotices, storageKey);
}

/**
 * Clear all dismissed notices from localStorage
 */
export function clearDismissedNotices(storageKey?: string): void {
	try {
		const key = storageKey || DEFAULT_STORAGE_KEY;
		localStorage.removeItem(key);
	} catch (error) {
		console.error('Failed to clear dismissed notices:', error);
	}
}

/**
 * Check if a notice is dismissed
 */
export function isNoticeDismissed(
	noticeId: string,
	storageKey?: string
): boolean {
	const dismissedNotices = getDismissedNoticesFromStorage(storageKey);
	return dismissedNotices.includes(noticeId);
}

/**
 * Store notice preferences in localStorage
 */
export function storeNoticePreferences(
	preferences: Object,
	storageKey?: string
): void {
	try {
		const key = `${storageKey || DEFAULT_STORAGE_KEY}_preferences`;
		localStorage.setItem(key, JSON.stringify(preferences));
	} catch (error) {
		console.error('Failed to store notice preferences:', error);
	}
}

/**
 * Get notice preferences from localStorage
 */
export function getNoticePreferences(storageKey?: string): Object {
	try {
		const key = `${storageKey || DEFAULT_STORAGE_KEY}_preferences`;
		const stored = localStorage.getItem(key);
		return stored ? JSON.parse(stored) : {};
	} catch (error) {
		console.error('Failed to get notice preferences:', error);
		return {};
	}
}
