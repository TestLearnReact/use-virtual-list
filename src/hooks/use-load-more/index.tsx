import { useMemo } from 'react';

import { TSetCachValue } from '../use-cache';
import { TCacheValues } from '../use-cache/types';
import { Measure, LoadMoreEvent } from '../../types';
import { getLastArrItem } from '../../utils';

export const useLoadMore = ({
	msDataRef,
	cache,
	loadMoreCount,
	loadMore,
	isItemLoaded,
	setCacheValue,
}: {
	msDataRef: React.MutableRefObject<Measure[]>;
	cache: TCacheValues;
	loadMoreCount: number;
	loadMore: (event: LoadMoreEvent) => void;
	isItemLoaded: (index: number) => boolean;
	setCacheValue: TSetCachValue;
}) => {
	const onLoadMoreMemo = useMemo(() => {
		if (msDataRef.current.length <= 0 || cache.visibleItemRange.length <= 0)
			return;

		const vStop = getLastArrItem(cache.visibleItemRange);
		const loadIndex = Math.max(
			Math.floor((vStop + 1) / loadMoreCount) -
				(cache.scrollData.scrollForward ? 0 : 1),
			0
		);
		const startIndex = loadIndex * loadMoreCount;
		const stopIndex = startIndex + loadMoreCount - 1;

		if (
			loadMore && //todo loadIndex > 0 &&
			isItemLoaded &&
			!isItemLoaded(loadIndex) &&
			cache.prevValues.prevVStop !== stopIndex
		) {
			//debugger;
			loadMore({
				startIndex,
				stopIndex, //: startIndex + loadMoreCount - 1,
				loadIndex,
				scrollOffset: cache.scrollData.scrollOffsetY,
				userScroll: true, //false,
			});

			cache.prevValues.prevVStop = stopIndex;
			// setCacheValue({
			//   key: 'prevVStop',
			//   value: startIndex + loadMoreCount - 1,
			// });
		}
	}, [msDataRef.current, cache.visibleItemRange]); //cache.scrollData,
};
