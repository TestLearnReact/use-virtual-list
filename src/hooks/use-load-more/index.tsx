import { useEffect } from 'react';
import { TSetCachValue } from '../use-cache';
import { TCacheValues } from '../use-cache/types';
import { Measure, LoadMoreType } from '../../types';
import { getLastArrItem } from '../../utils';

export const useLoadMore = ({
	cache,
	loadMoreProps,
	setCacheValue,
}: {
	cache: TCacheValues;
	setCacheValue: TSetCachValue;
	loadMoreProps?: LoadMoreType;
}) => {
	useEffect(() => {
		if (cache.visibleItemRange.length <= 0 || !loadMoreProps) return;

		const { loadMore, loadMoreCount, isItemLoaded } = loadMoreProps;

		const vStop = getLastArrItem(cache.visibleItemRange);
		const loadIndex = Math.max(
			Math.floor((vStop + 1) / loadMoreCount) -
				(cache.scrollData.scrollForward ? 0 : 1),
			0
		);
		const startIndex = loadIndex * loadMoreCount;
		const stopIndex = startIndex + loadMoreCount - 1;

		setCacheValue({
			key: '_loadMore',
			value: false,
		});

		if (loadMore && !isItemLoaded(loadIndex) && cache.prevVStop !== stopIndex) {
			setCacheValue({
				key: '_loadMore',
				value: true,
			});

			loadMore({
				startIndex,
				stopIndex,
				loadIndex,
				scrollOffset: cache.scrollData.scrollOffsetY,
				userScroll: true,
			});

			setCacheValue({
				key: 'prevVStop',
				value: stopIndex,
			});
		}
	}, [
		loadMoreProps,
		setCacheValue,
		cache.visibleItemRange,
		cache.scrollData,
		cache.prevVStop,
	]);

	return { isFetching: cache._loadMore };
};
