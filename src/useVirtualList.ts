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

	const { outerContainerStyle, innerContainerStyle } = useContainerStyle({
		msDataRef,
		cache,
		itemsLength: items.length,
		refOuterContainer,
		refInnerContainer,
	});

	useScrollOffset({
		effect: ({ prevData, currData }) => {
			setCacheValue({
				key: 'scrollData',
				value: {
					scrollOffsetX: currData.x,
					scrollOffsetY: currData.y,
					scrollSpeed:
						Math.abs(currData.y - prevData.y) /
						(Date.now() - prevData.timestamp),
					scrollForward: currData.y > prevData.y,
				},
			});

			console.log('scroll: ', currData.y);

			// visible rows [0, 1, ...,7]
			visibleItemRange({
				itemOffsets: itemOffsets,
				isScrolling: true,
			});
		},

		scrollWindowOrElement: useWindowScroll
			? { useWindowScroll: true }
			: { element: refOuterContainer },
		// deps: [listDirection],
		// wait: 10,
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
					!needNewCalcVisbleRange<O, I>({
						msDataRef,
						cache,
						///refInnerContainer,
						refOuterContainer,
						totalSize: innerContainerStyle.totalSize, // todo refInner ?
						useWindowScroll,
					}))
			) {
				//return;
			}

			const range = getExtendedVisibleItemRange(
				listSize,
				itemSize,
				items.length,
				cache.scrollData.scrollOffsetY,
				itemOffsets,
				overscan,
				cache.scrollData.scrollForward
			);

			if (isScrolling && isSameRange(cache.visibleItemRange, range)) {
				return;
				// return range;
			}

			setCacheValue({ key: 'visibleItemRange', value: range });

			// console.log('-- RANGE:: ', range);
			//debugger;

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
		// todo window innerContainerStyle.totalSize ?
		// outer inner ref developer/parameter part ?

		[
			listSize,
			items.length,
			items,
			itemOffsets,
			innerContainerStyle.totalSize,
			itemsSnapshotSignature,
		] // visibleItems ,
	);

	const getMeasuredItem = useCallback(
		(itemIndex: number) => msDataRef.current[itemIndex],
		[msDataRef] //  itemOffsets msDataRef.current itemsSnapshotSignature !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	);

	/** Fetch more data */
	useLoadMore({
		cache,
		msDataRef,
		loadMoreProps,
		setCacheValue,
	});

	/**
	 *
	 *   INIT
	 *   INIT
	 *
	 * */
	useIsomorphicLayoutEffect(() => {
		if (!items[0] || itemOffsets.length <= 0) return;

		const resize = cache.prevViewportWidth !== viewportWidth;
		//debugger;
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
				msDataRef
				//cache,
			);
		}

		cache.prevViewportWidth = viewportWidth;
	}, [items, items.length, itemOffsets, xouterRef, xinnerRef]);

	useIsomorphicLayoutEffect(() => {
		if (xinnerRef) refInnerContainer.current = xinnerRef.current;
		if (xouterRef) refOuterContainer.current = xouterRef.current;
	}, [xouterRef, xinnerRef]);

	return {
		refOuter: refOuterContainer,
		refInner: refInnerContainer,
		visibleItems: hookReturnState.visibleItems, // visibleItems,
		containerStyles: {
			outer: { ...outerContainerStyle },
			inner: { ...innerContainerStyle },
		},
		getMeasuredItem,
		scrollingSpeed: cache.scrollData.scrollSpeed,
		msDataRef: msDataRef.current,
	};
}
