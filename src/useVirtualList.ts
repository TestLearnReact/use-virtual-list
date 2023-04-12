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
	viewportHeight,
	viewportWidth,
	xouterRef,
	xinnerRef,
	items,
	itemSize,
	listSize = 0,
	listDirection = Direction.Vertical,
	overscan = 10,
	loadMoreProps,
	useWindowScroll = false,
	wait,
}: IVirtualListProps<ItemType, O, I>): IHookReturn<ItemType, O, I> {
	const refOuterContainer = useRef<O | null>(null);
	const refInnerContainer = useRef<I | null>(null);

	const [hookReturnState, setHookReturnState] = useState<{
		visibleItems: VisibleItemDescriptor<ItemType>[];
	}>({
		visibleItems: [],
	});

	const { cache, setCacheValue } = useCache({});

	const { itemOffsets, itemsSnapshotSignature, msDataRef } =
		useItemOffsets<ItemType>({
			items,
			itemSize,
		});

	const { containerStyles } = useContainerStyle({
		msDataRef,
		cache,
		itemsLength: items.length,
		refOuterContainer,
		refInnerContainer,
	});

	/** Fetch more data */
	const { isFetching } = useLoadMore({
		cache,
		msDataRef,
		loadMoreProps,
		setCacheValue,
	});

	useScrollOffset({
		effect: ({ prevData, currData }) => {
			const xY = listDirection === Direction.Vertical ? 'y' : 'x';

			setCacheValue({
				key: 'scrollData',
				value: {
					scrollOffsetX: currData.x,
					scrollOffsetY: currData.y,
					scrollSpeed:
						Math.abs(currData[xY] - prevData[xY]) /
						(Date.now() - prevData.timestamp),
					scrollForward: currData[xY] > prevData[xY],
				},
			});

			console.log('scroll: ', currData.y, currData.x, isFetching);

			// visible rows [0, 1, ...,7]
			visibleItemRange({
				itemOffsets: itemOffsets,
				isScrolling: true,
			});
		},

		scrollWindowOrElement: useWindowScroll
			? { useWindowScroll: true }
			: { element: refOuterContainer },
		wait,
	});

	const visibleItemRange = useCallback(
		({
			itemOffsets,
			isScrolling,
		}: {
			itemOffsets: number[];
			isScrolling: boolean;
		}) => {
			if (
				itemOffsets.length <= 0 ||
				!items[0] ||
				(cache.visibleItemRange[0] !== -1 &&
					isScrolling &&
					!needNewCalcVisbleRange({
						msDataRef,
						cache,
						useWindowScroll,
						listDirection,
						containerStyles,
					}))
			) {
				return [];
			}

			const range = getExtendedVisibleItemRange(
				listSize,
				itemSize,
				items.length,
				listDirection === Direction.Vertical
					? cache.scrollData.scrollOffsetY
					: cache.scrollData.scrollOffsetX,
				itemOffsets,
				overscan,
				cache.scrollData.scrollForward
			);

			// loadMore bug?-> containerStyles totalsize or msDataRef[last]?
			if (isScrolling && isSameRange(cache.visibleItemRange, range)) {
				return range;
			}
			// if (isSameRange(cache.visibleItemRange, range)) {
			// 	return range;
			// }

			setCacheValue({ key: 'visibleItemRange', value: range });

			console.log(
				'-- RANGE:: ',
				range,
				cache._loadMore,
				cache.scrollData.scrollForward
			);

			const visibleItems = range.map(
				(itemIndex): VisibleItemDescriptor<ItemType> => {
					const item = items[itemIndex];
					const size = msDataRef.current[itemIndex].size;
					const offset = msDataRef.current[itemIndex].start;

					// todo return msDataRef, listDirection in other: {} eg.
					return {
						item,
						itemIndex,
						size,
						offset,
						listDirection,
					};
				}
			);

			setHookReturnState({
				visibleItems: visibleItems,
			});

			return range;
		},
		[
			cache,
			itemSize,
			items,
			listDirection,
			listSize,
			msDataRef,
			overscan,
			setCacheValue,
			useWindowScroll,
			containerStyles,
		]
	);

	const getMeasuredItem = useCallback(
		(itemIndex: number) => msDataRef.current[itemIndex],
		[msDataRef] //  itemOffsets msDataRef.current itemsSnapshotSignature !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	);

	/**
	 *
	 *   INIT
	 *   INIT
	 *
	 * */
	useIsomorphicLayoutEffect(() => {
		if (!items[0] || itemOffsets.length <= 0) return;

		if (cache._loadMore) return;

		const resize = cache.prevViewportWidth !== viewportWidth;

		if (
			cache.prevViewportWidth == 0 || // init
			!resize // prevent rerender/double calcs / comes from main/outside !?
		) {
			const initVisibleRange = visibleItemRange({
				itemOffsets: itemOffsets,
				isScrolling: false,
			});
			console.log(
				':: INIT :: ',
				itemOffsets,
				initVisibleRange,
				'msDataRef ',
				msDataRef,
				cache._loadMore
				//cache,
			);
		}

		cache.prevViewportWidth = viewportWidth;
	}, [items, items.length, itemOffsets]); //xouterRef, xinnerRef itemOffsets

	useIsomorphicLayoutEffect(() => {
		if (xinnerRef) refInnerContainer.current = xinnerRef.current;
		if (xouterRef) refOuterContainer.current = xouterRef.current;
	}, [xouterRef, xinnerRef]);

	return {
		refOuter: refOuterContainer,
		refInner: refInnerContainer,
		visibleItems: hookReturnState.visibleItems, // visibleItems,
		containerStyles: containerStyles,
		getMeasuredItem,
		scrollingSpeed: cache.scrollData.scrollSpeed,
		msDataRef: msDataRef.current,
	};
}

// todo put if statements like itemSize function/number, scroll const xY = listDirection === Direction.Vertical ? 'y' : 'x'; in useRef()
