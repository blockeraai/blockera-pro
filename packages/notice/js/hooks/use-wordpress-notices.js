// @flow

/**
 * External dependencies
 */
import { useState, useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { useNoticeContext } from '../context/notice-provider';
import {
	fetchWordPressNotices,
	createWordPressNotice,
	updateWordPressNotice,
	deleteWordPressNotice,
	convertWordPressNotice,
	convertToWordPressNotice,
	storeDismissedNotice,
	getDismissedNotices,
} from '../utils/wordpress-utils';
import type { WordPressNotice, NoticeConfig } from '../types';

/**
 * Hook for WordPress notice integration
 */
export default function useWordPressNotices(): Object {
	const context = useNoticeContext();
	const [wpNotices, setWpNotices] = useState<Array<WordPressNotice>>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<?string>(null);

	/**
	 * Load WordPress notices from API
	 */
	const loadWordPressNotices = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const notices = await fetchWordPressNotices();
			const dismissedNotices = await getDismissedNotices();

			// Filter out dismissed notices
			const filteredNotices = notices.filter(
				(notice) => !dismissedNotices.includes(notice.id)
			);

			setWpNotices(filteredNotices);

			// Add to context
			filteredNotices.forEach((wpNotice) => {
				const noticeConfig = convertWordPressNotice(wpNotice);
				context.addNotice(noticeConfig);
			});
		} catch (err) {
			setError(err.message || 'Failed to load WordPress notices');
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Create a new WordPress notice
	 */
	const createNotice = async (
		notice: NoticeConfig
	): Promise<?WordPressNotice> => {
		setIsLoading(true);
		setError(null);

		try {
			const wpNoticeData = convertToWordPressNotice(notice);
			const createdNotice = await createWordPressNotice(wpNoticeData);

			if (createdNotice) {
				setWpNotices((prev) => [...prev, createdNotice]);
				// Add to context
				const noticeConfig = convertWordPressNotice(createdNotice);
				context.addNotice(noticeConfig);
			}

			return createdNotice;
		} catch (err) {
			setError(err.message || 'Failed to create WordPress notice');
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Update a WordPress notice
	 */
	const updateNotice = async (
		id: string,
		updates: Partial<NoticeConfig>
	): Promise<?WordPressNotice> => {
		setIsLoading(true);
		setError(null);

		try {
			// $FlowFixMe
			const wpUpdates = convertToWordPressNotice(updates);
			const updatedNotice = await updateWordPressNotice(id, wpUpdates);

			if (updatedNotice) {
				setWpNotices((prev) =>
					prev.map((notice) =>
						notice.id === id ? updatedNotice : notice
					)
				);
				// Update in context
				const noticeConfig = convertWordPressNotice(updatedNotice);
				// $FlowFixMe
				context.updateNotice(id, noticeConfig);
			}

			return updatedNotice;
		} catch (err) {
			setError(err.message || 'Failed to update WordPress notice');
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Delete a WordPress notice
	 */
	const deleteNotice = async (id: string): Promise<boolean> => {
		setIsLoading(true);
		setError(null);

		try {
			const success = await deleteWordPressNotice(id);

			if (success) {
				setWpNotices((prev) =>
					prev.filter((notice) => notice.id !== id)
				);
				context.removeNotice(id);
			}

			return success;
		} catch (err) {
			setError(err.message || 'Failed to delete WordPress notice');
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Dismiss a WordPress notice
	 */
	const dismissNotice = async (id: string): Promise<boolean> => {
		try {
			const success = await storeDismissedNotice(id);

			if (success) {
				setWpNotices((prev) =>
					prev.filter((notice) => notice.id !== id)
				);
				context.dismissNotice(id);
			}

			return success;
		} catch (err) {
			setError(err.message || 'Failed to dismiss WordPress notice');
			return false;
		}
	};

	/**
	 * Sync local notices with WordPress
	 */
	const syncWithWordPress = async () => {
		await loadWordPressNotices();
	};

	/**
	 * Load notices on mount
	 */
	useEffect(() => {
		loadWordPressNotices();
	}, []);

	return {
		// State
		wpNotices,
		isLoading,
		error,

		// Actions
		loadWordPressNotices,
		createNotice,
		updateNotice,
		deleteNotice,
		dismissNotice,
		syncWithWordPress,
	};
}
