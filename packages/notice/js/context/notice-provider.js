// @flow

/**
 * External dependencies
 */
import {
	createContext,
	useContext,
	useReducer,
	useEffect,
} from '@wordpress/element';

/**
 * Blockera dependencies
 */
import { isFunction } from '@blockera/utils';

/**
 * Internal dependencies
 */
import type {
	NoticeContextValue,
	NoticeProviderProps,
	NoticeConfig,
	NoticeState,
} from '../types';
import { createNoticeConfig, filterNoticesByContext } from '../utils';
import {
	getDismissedNoticesFromStorage,
	addDismissedNotice,
} from '../utils/storage-utils';

/**
 * Notice Context
 */
const NoticeContext = createContext<NoticeContextValue | null>(null);

/**
 * Notice Reducer Actions
 */
const NOTICE_ACTIONS = {
	ADD_NOTICE: 'ADD_NOTICE',
	REMOVE_NOTICE: 'REMOVE_NOTICE',
	DISMISS_NOTICE: 'DISMISS_NOTICE',
	CLEAR_NOTICES: 'CLEAR_NOTICES',
	UPDATE_NOTICE: 'UPDATE_NOTICE',
	SET_LOADING: 'SET_LOADING',
	SET_ERROR: 'SET_ERROR',
};

/**
 * Initial state
 */
const initialState: NoticeState = {
	notices: [],
	dismissedNotices: [],
	isLoading: false,
	error: null,
};

/**
 * Notice Reducer
 */
function noticeReducer(state: NoticeState, action: any): NoticeState {
	switch (action.type) {
		case NOTICE_ACTIONS.ADD_NOTICE:
			return {
				...state,
				notices: [...state.notices, action.payload],
			};

		case NOTICE_ACTIONS.REMOVE_NOTICE:
			return {
				...state,
				notices: state.notices.filter(
					(notice) => notice.id !== action.payload
				),
			};

		case NOTICE_ACTIONS.DISMISS_NOTICE:
			return {
				...state,
				notices: state.notices.filter(
					(notice) => notice.id !== action.payload
				),
				dismissedNotices: [...state.dismissedNotices, action.payload],
			};

		case NOTICE_ACTIONS.CLEAR_NOTICES:
			return {
				...state,
				notices: [],
			};

		case NOTICE_ACTIONS.UPDATE_NOTICE:
			return {
				...state,
				notices: state.notices.map((notice) =>
					notice.id === action.payload.id
						? { ...notice, ...action.payload.updates }
						: notice
				),
			};

		case NOTICE_ACTIONS.SET_LOADING:
			return {
				...state,
				isLoading: action.payload,
			};

		case NOTICE_ACTIONS.SET_ERROR:
			return {
				...state,
				error: action.payload,
			};

		default:
			return state;
	}
}

/**
 * Notice Provider Component
 */
export default function NoticeProvider({
	children,
	initialNotices = [],
	persistDismissed = true,
	storageKey = 'blockera_dismissed_notices',
}: NoticeProviderProps) {
	const [state, dispatch] = useReducer(noticeReducer, {
		...initialState,
		notices: initialNotices.map(createNoticeConfig),
	});

	// Load dismissed notices from storage on mount
	useEffect(() => {
		if (persistDismissed) {
			const dismissedNotices = getDismissedNoticesFromStorage(storageKey);
			dispatch({
				type: NOTICE_ACTIONS.SET_LOADING,
				payload: false,
			});
			// Filter out dismissed notices from initial notices
			const filteredNotices = state.notices.filter(
				(notice) => !dismissedNotices.includes(notice.id || '')
			);
			if (filteredNotices.length !== state.notices.length) {
				dispatch({
					type: NOTICE_ACTIONS.CLEAR_NOTICES,
				});
				filteredNotices.forEach((notice) => {
					dispatch({
						type: NOTICE_ACTIONS.ADD_NOTICE,
						payload: notice,
					});
				});
			}
		}
	}, [persistDismissed, storageKey]);

	/**
	 * Add a new notice
	 */
	const addNotice = (notice: NoticeConfig) => {
		const noticeConfig = createNoticeConfig(notice);

		dispatch({
			type: NOTICE_ACTIONS.ADD_NOTICE,
			payload: noticeConfig,
		});

		// Auto-close notice if specified
		if (noticeConfig.autoClose && noticeConfig.duration) {
			setTimeout(() => {
				removeNotice(noticeConfig.id || '');
			}, noticeConfig.duration);
		}

		// Call onShow callback
		if (isFunction(noticeConfig.onShow)) {
			noticeConfig.onShow();
		}
	};

	/**
	 * Remove a notice
	 */
	const removeNotice = (id: string) => {
		dispatch({
			type: NOTICE_ACTIONS.REMOVE_NOTICE,
			payload: id,
		});
	};

	/**
	 * Dismiss a notice (remove and remember dismissal)
	 */
	const dismissNotice = (id: string) => {
		const notice = state.notices.find((n) => n.id === id);

		dispatch({
			type: NOTICE_ACTIONS.DISMISS_NOTICE,
			payload: id,
		});

		// Store dismissal if persistent
		if (persistDismissed && notice?.persistent) {
			addDismissedNotice(id, storageKey);
		}

		// Call onDismiss callback
		if (notice && isFunction(notice.onDismiss)) {
			notice.onDismiss();
		}
	};

	/**
	 * Clear all notices
	 */
	const clearNotices = () => {
		dispatch({
			type: NOTICE_ACTIONS.CLEAR_NOTICES,
		});
	};

	/**
	 * Get notices by context
	 */
	const getNoticesByContext = (context: string): Array<NoticeConfig> => {
		return filterNoticesByContext(state.notices, context);
	};

	/**
	 * Update a notice
	 */
	const updateNotice = (id: string, updates: Partial<NoticeConfig>) => {
		dispatch({
			type: NOTICE_ACTIONS.UPDATE_NOTICE,
			payload: { id, updates },
		});
	};

	const contextValue: NoticeContextValue = {
		...state,
		addNotice,
		removeNotice,
		dismissNotice,
		clearNotices,
		getNoticesByContext,
		updateNotice,
	};

	return (
		<NoticeContext.Provider value={contextValue}>
			{children}
		</NoticeContext.Provider>
	);
}

/**
 * Hook to use notice context
 */
export function useNoticeContext(): NoticeContextValue {
	const context = useContext(NoticeContext);
	if (!context) {
		throw new Error(
			'useNoticeContext must be used within a NoticeProvider'
		);
	}
	return context;
}
