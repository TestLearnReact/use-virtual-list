import { useCallback, useRef, useState } from 'react';
import {
	Direction,
	IHookReturn,
	IVirtualListProps,
	VisibleItemDescriptor,
} from './types';
import {
	useCache,
	useItemOffsets,
	useContainerStyle,
	useLoadMore,
	useScrollOffset,
	useIsomorphicLayoutEffect,
} from './hooks';

import {
	getExtendedVisibleItemRange,
	isSameRange,
	needNewCalcVisbleRange,
} from './utils';

export function useVirtualList<
	ItemType,
	O extends HTMLElement = HTMLElement,
	I extends HTMLElement = O
>({
	xouterRef,
	xinnerRef,
	items,
	itemSize,
	listDirection = Direction.Vertical,
	overscan = 10,
	loadMoreProps,
	useWindowScroll = false,
	waitScroll,
	onScroll,
	// scrollSpeedSkip,
	skipRenderProps,
}: IVirtualListProps<ItemType, O, I>): IHookReturn<ItemType, O, I> {
	const refOuterContainer = useRef<O | null>(null);
	const refInnerContainer = useRef<I | null>(null);

	const { current: refItemSize } = useRef(itemSize);

	const _sizeKey = listDirection == Direction.Vertical ? 'height' : 'width';
	const _scrollKey = listDirection == Direction.Vertical ? 'y' : 'x';

	const [hookReturnState, setHookReturnState] = useState<{
		visibleItems: VisibleItemDescriptor<ItemType>[];
	}>({
		visibleItems: [],
	});

	const { cache, setCacheValue } = useCache({});

	/** Fetch more data */
	const { isFetching } = useLoadMore({
		cache,
		loadMoreProps,
		setCacheValue,
		_scrollKey,
	});

	const { itemOffsets, itemsSnapshotSignature, msDataRef } =
		useItemOffsets<ItemType>({
			items,
			itemSize: refItemSize,
		});

	const { containerStyles, _resize } = useContainerStyle({
		msDataRef,
		cache,
		itemsLength: items.length,
		refOuterContainer,
		refInnerContainer,
		_sizeKey,
	});

	useScrollOffset({
		effect: ({ prevData, currData }) => {
			let scrollSpeed = 0;
			scrollSpeed =
				Math.abs(currData[_scrollKey] - prevData[_scrollKey]) /
				(Date.now() - prevData.timestamp);

			setCacheValue({
				key: 'scrollData',
				value: {
					prevData,
					currData,
					scrollSpeed,
					scrollForward: currData[_scrollKey] > prevData[_scrollKey],
				},
			});

			onScroll({ currData, prevData, scrollSpeed }); // todo not defined

			if (skipRenderProps) {
				let wait = 0;

				if (scrollSpeed > skipRenderProps.scrollSpeedSkip) {
					// do not render any item until scroll stop
					wait = skipRenderProps.waitRender;
					scrollSpeed = 0;
				}

				if (cache._timerScrollStop !== null) {
					clearTimeout(cache._timerScrollStop);
				}
				cache._timerScrollStop = setTimeout(function () {
					// scroll stop after skip rendering
					if (wait > 0) {
						onScroll({ currData, prevData, scrollSpeed });
						setCacheValue({
							key: 'scrollData',
							value: {
								prevData,
								currData,
								scrollSpeed,
								scrollForward: currData[_scrollKey] > prevData[_scrollKey],
							},
						});
					}

					visibleItemRange();
				}, wait);

				return;
			}

			visibleItemRange();
		},

		scrollWindowOrElement: useWindowScroll
			? { useWindowScroll: true }
			: { element: refOuterContainer },
		wait: waitScroll,
		deps: [],
	});

	const visibleItemRange = useCallback(() => {
		if (
			cache.visibleItemRange[0] !== -1 &&
			!needNewCalcVisbleRange<ItemType>({
				msDataRef,
				cache,
				useWindowScroll,
				listDirection,
				containerStyles,
				items,
				itemOffsets,
				_scrollKey,
			})
		) {
			return [];
		}

		const range = getExtendedVisibleItemRange(
			containerStyles.outerContainerStyle[_sizeKey],
			itemSize,
			items.length,
			cache.scrollData.currData[_scrollKey],
			itemOffsets,
			overscan,
			cache.scrollData.scrollForward
		);

		// loadMore bug?-> containerStyles totalsize or msDataRef[last]?
		// if (isScrolling && isSameRange(cache.visibleItemRange, range)) {
		// 	return range;
		// }
		if (isSameRange(cache.visibleItemRange, range)) {
			return range;
		}

		setCacheValue({ key: 'visibleItemRange', value: range });

		//console.log('-- RANGE:: ', range, cache._loadMore, isFetching);

		// // loadMore less items are fetched than visible
		// if (range.length > msDataRef.current.length) return;

		// loadMore() loadMoreIndex for loop instead of map to ensure items are measured,
		// because diff. msDataRef/items (size not defined)-> new items are fetched and not jet measured
		const visibleItems = range.map(
			(itemIndex): VisibleItemDescriptor<ItemType> => {
				const item = items[itemIndex];
				const size = msDataRef.current[itemIndex].size || 0;
				const offset = msDataRef.current[itemIndex].start;

				return {
					item,
					itemIndex,
					size,
					offset,
				};
			}
		);

		setHookReturnState({
			visibleItems: visibleItems,
		});

		return range;
	}, [
		cache,
		itemSize,
		items,
		listDirection,
		msDataRef,
		overscan,
		setCacheValue,
		useWindowScroll,
		containerStyles,
		_sizeKey,
		_scrollKey,
		itemOffsets,
	]);

	const getMeasuredItem = useCallback(
		(itemIndex: number) => msDataRef.current[itemIndex],
		[msDataRef]
	);

	/**
	 *
	 *   INIT
	 *   INIT
	 *
	 * */
	useIsomorphicLayoutEffect(() => {
		if (xinnerRef) refInnerContainer.current = xinnerRef.current;
		if (xouterRef) refOuterContainer.current = xouterRef.current;
	}, [xouterRef, xinnerRef]);

	useIsomorphicLayoutEffect(() => {
		if (!items[0] || itemOffsets.length <= 0) return;
		if (_resize || cache._isMounted) return;

		const initVisibleRange = visibleItemRange();

		setCacheValue({ key: '_isMounted', value: true });

		console.log(':: INIT :: ', itemOffsets, initVisibleRange);
	}, [itemOffsets, _resize]);

	return {
		refOuter: refOuterContainer,
		refInner: refInnerContainer,
		visibleItems: hookReturnState.visibleItems,
		containerStyles: containerStyles,
		getMeasuredItem,
		scrollingSpeed: cache.scrollData.scrollSpeed,
		msDataRef: msDataRef.current,
		isFetching: cache._loadMore,
	};
}

// todo put if statements like itemSize function/number, scroll const xY = listDirection === Direction.Vertical ? 'y' : 'x'; in useRef()
// listSize -> containerStyles ssr/fallback prop?

// https://blog.logrocket.com/when-not-to-use-usememo-react-hook/

// // use itemsSnapshotSignature in eg getMeasuredItem() instead of itemOffsets, msDataRef.current -> currently eslint error !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
