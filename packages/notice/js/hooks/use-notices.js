// @flow

/**
 * Internal dependencies
 */
import { useNoticeContext } from '../context/notice-provider';
import type { NoticeConfig } from '../types';

/**
 * Hook for managing notices
 */
export default function useNotices(): Object {
	const context = useNoticeContext();

	/**
	 * Add a success notice
	 */
	const addSuccessNotice = (
		message: string,
		options?: Partial<NoticeConfig>
	) => {
		// $FlowFixMe
		context.addNotice({
			type: 'success',
			message,
			...options,
		});
	};

	/**
	 * Add an error notice
	 */
	const addErrorNotice = (
		message: string,
		options?: Partial<NoticeConfig>
	) => {
		// $FlowFixMe
		context.addNotice({
			type: 'error',
			message,
			...options,
		});
	};

	/**
	 * Add a warning notice
	 */
	const addWarningNotice = (
		message: string,
		options?: Partial<NoticeConfig>
	) => {
		// $FlowFixMe
		context.addNotice({
			type: 'warning',
			message,
			...options,
		});
	};

	/**
	 * Add an info notice
	 */
	const addInfoNotice = (
		message: string,
		options?: Partial<NoticeConfig>
	) => {
		// $FlowFixMe
		context.addNotice({
			type: 'info',
			message,
			...options,
		});
	};

	/**
	 * Add a custom notice
	 */
	const addNotice = (notice: NoticeConfig) => {
		context.addNotice(notice);
	};

	/**
	 * Remove a notice by ID
	 */
	const removeNotice = (id: string) => {
		context.removeNotice(id);
	};

	/**
	 * Dismiss a notice by ID
	 */
	const dismissNotice = (id: string) => {
		context.dismissNotice(id);
	};

	/**
	 * Clear all notices
	 */
	const clearNotices = () => {
		context.clearNotices();
	};

	/**
	 * Get notices by context
	 */
	const getNoticesByContext = (contextName: string) => {
		return context.getNoticesByContext(contextName);
	};

	/**
	 * Update a notice
	 */
	const updateNotice = (id: string, updates: Partial<NoticeConfig>) => {
		context.updateNotice(id, updates);
	};

	return {
		// State
		notices: context.notices,
		dismissedNotices: context.dismissedNotices,
		isLoading: context.isLoading,
		error: context.error,

		// Actions
		addNotice,
		addSuccessNotice,
		addErrorNotice,
		addWarningNotice,
		addInfoNotice,
		removeNotice,
		dismissNotice,
		clearNotices,
		getNoticesByContext,
		updateNotice,
	};
}
