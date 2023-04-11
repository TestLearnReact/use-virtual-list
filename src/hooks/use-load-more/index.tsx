import { useEffect, useState } from 'react';
import { TSetCachValue } from '../use-cache';
import { TCacheValues } from '../use-cache/types';
import { Measure, LoadMoreType } from '../../types';
import { getLastArrItem } from '../../utils';

export const useLoadMore = ({
	msDataRef,
	cache,
	loadMoreProps,
	setCacheValue,
}: {
	msDataRef: React.MutableRefObject<Measure[]>;
	cache: TCacheValues;
	setCacheValue: TSetCachValue;
	loadMoreProps?: LoadMoreType;
}) => {
	const [isFetching, setIsFetching] = useState(false);

	useEffect(() => {
		if (
			msDataRef.current.length <= 0 ||
			cache.visibleItemRange.length <= 0 ||
			!loadMoreProps
		)
			return;

		setIsFetching(false);

		const { loadMore, loadMoreCount, isItemLoaded } = loadMoreProps;

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
			cache.prevVStop !== stopIndex
		) {
			loadMore({
				startIndex,
				stopIndex,
				loadIndex,
				scrollOffset: cache.scrollData.scrollOffsetY,
				userScroll: true,
			});

			//			cache.prevValues.prevVStop = stopIndex;
			setCacheValue({
				key: 'prevVStop',
				value: stopIndex,
			});

			setIsFetching(true);
		}
	}, [
		msDataRef,
		loadMoreProps,
		setCacheValue,
		cache.visibleItemRange,
		cache.scrollData,
		cache.prevVStop,
	]);

	return { isFetching };
};
