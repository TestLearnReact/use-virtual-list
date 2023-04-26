import { DependencyList, useCallback, useRef } from 'react';
import { TCacheValues, TSetCachValue } from './types';

export const useCache = ({ deps }: { deps?: DependencyList }) => {
	const refCache = useRef<TCacheValues>({
		visibleItemRange: [-1], //
		loadMore: (event) => null,
		isItemLoaded: (index) => false,
		prevViewportWidth: 0,
		prevViewportHeight: 0,
		prevVStop: 0,
		scrollData: {
			scrollOffsetX: 0,
			scrollOffsetY: 0,
			scrollSpeed: 0,
			scrollForward: true,
		},
		_loadMore: false,
		_timerScrollStop: null,
	});

	const setCacheValue: TSetCachValue = useCallback(({ key, value }) => {
		refCache.current[key] = value;
	}, []);

	const getCacheValue = useCallback(<T extends keyof TCacheValues>(key: T) => {
		return refCache.current[key];
	}, []);

	return { cache: refCache.current, setCacheValue, getCacheValue };
};
