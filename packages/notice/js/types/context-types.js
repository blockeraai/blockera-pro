// @flow

/**
 * Internal dependencies
 */
import type { NoticeConfig, NoticeState } from './notice-types';

/**
 * Notice Context Value
 */
export type NoticeContextValue = {
	...NoticeState,
	addNotice: (notice: NoticeConfig) => void,
	removeNotice: (id: string) => void,
	dismissNotice: (id: string) => void,
	clearNotices: () => void,
	getNoticesByContext: (context: string) => Array<NoticeConfig>,
	updateNotice: (id: string, updates: Partial<NoticeConfig>) => void,
};

/**
 * Notice Provider Props
 */
export type NoticeProviderProps = {
	children: any,
	initialNotices?: Array<NoticeConfig>,
	persistDismissed?: boolean,
	storageKey?: string,
};
