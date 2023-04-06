//import { useCallback, useMemo, useRef, useState } from 'react';
import {
	RefCallback,
	RefObject,
	useCallback,
	useEffect,
	useRef,
	useMemo,
	useState,
} from 'react';
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

	//useResolvedElement,
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
	isItemLoaded,
	loadMore,
	loadMoreCount = 5,
	useWindowScroll = false,
}: IVirtualListProps<ItemType, O, I>): IHookReturn<ItemType, O, I> {
	// const refOuterContainer = useRef<O>();
	// const refInnerContainer = useRef<I>();
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
				// return;
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
		[msDataRef.current, itemsSnapshotSignature] //  itemOffsets
	);

	/** Fetch more data */
	useLoadMore({
		cache,
		msDataRef,
		isItemLoaded,
		loadMore,
		loadMoreCount,
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

		const resize = cache.prevValues.viewportWidth !== viewportWidth;

		if (
			cache.prevValues.viewportWidth == 0 || // init
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

		cache.prevValues.viewportWidth = viewportWidth;
	}, [items, items.length, itemOffsets]);

	useIsomorphicLayoutEffect(() => {
		if (xinnerRef) refInnerContainer.current = xinnerRef.current;
		if (xouterRef) refOuterContainer.current = xouterRef.current;
	}, [xouterRef, xinnerRef]);

	// /**
	//  * prevent rerender / use useRef or ref={refOuter} in parent component
	//  * */
	// const refCallbackOuter = useResolvedElement<O>(
	// 	useCallback((element) => {
	// 		console.log('outer: ', element.getBoundingClientRect());
	// 		refOuterContainer.current = element;
	// 	}, []),
	// 	xouterRef
	// );

	// /**
	//  * prevent rerender / use useRef or ref={refInner} in parent component
	//  * */
	// const refCallbackInner = useResolvedElement<I>(
	// 	useCallback(
	// 		(element) => {
	// 			console.log('inner: ', element.getBoundingClientRect());
	// 			// setRerender(!rerender);
	// 			refInnerContainer.current = element;
	// 		},
	// 		[refInnerContainer.current?.offsetHeight]
	// 	),
	// 	xinnerRef
	// );

	return {
		// refOuter: useMemo(() => refCallbackOuter, [refCallbackOuter]),
		// refInner: useMemo(() => refCallbackInner, [refCallbackInner]),
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

// const initValues = {
//   visibleItems: {
//     item: items[-1],
//     itemIndex: -1,
//     size: -1,
//     offset: -1,
//     listDirection,
//   },
// };

// todo declared twice hooks

type SubscriberCleanupFunction = () => void;
type SubscriberResponse = SubscriberCleanupFunction | void;

// This could've been more streamlined with internal state instead of abusing
// refs to such extent, but then composing hooks and components could not opt out of unnecessary renders.
export default function useResolvedElement<T extends Element>(
	subscriber: (element: T) => SubscriberResponse,
	refOrElement?: T | RefObject<T> | null
): RefCallback<T> {
	const lastReportRef = useRef<{
		element: T | null;
		subscriber: typeof subscriber;
		cleanup?: SubscriberResponse;
	} | null>(null);
	const refOrElementRef = useRef<typeof refOrElement>(null);
	refOrElementRef.current = refOrElement;
	const cbElementRef = useRef<T | null>(null);

	// Calling re-evaluation after each render without using a dep array,
	// as the ref object's current value could've changed since the last render.
	useEffect(() => {
		evaluateSubscription();
	});

	const evaluateSubscription = useCallback(() => {
		const cbElement = cbElementRef.current;
		const refOrElement = refOrElementRef.current;
		// console.log(
		//   cbElement,
		//   refOrElement,
		//   refOrElement instanceof Element,
		//   //refOrElement.current,
		// );
		// Ugly ternary. But smaller than an if-else block.
		const element: T | null = cbElement
			? cbElement
			: refOrElement
			? refOrElement instanceof Element
				? refOrElement
				: refOrElement.current
			: null;

		if (
			lastReportRef.current &&
			lastReportRef.current.element === element &&
			lastReportRef.current.subscriber === subscriber
		) {
			return;
		}
		// debugger;
		if (lastReportRef.current && lastReportRef.current.cleanup) {
			lastReportRef.current.cleanup();
		}
		lastReportRef.current = {
			element,
			subscriber,
			// Only calling the subscriber, if there's an actual element to report.
			// Setting cleanup to undefined unless a subscriber returns one, as an existing cleanup function would've been just called.
			cleanup: element ? subscriber(element) : undefined,
		};
	}, [subscriber]);

	// making sure we call the cleanup function on unmount
	useEffect(() => {
		return () => {
			if (lastReportRef.current && lastReportRef.current.cleanup) {
				lastReportRef.current.cleanup();
				lastReportRef.current = null;
			}
		};
	}, []);

	return useCallback(
		(element) => {
			cbElementRef.current = element;
			evaluateSubscription();
		},
		[evaluateSubscription]
	);
}
export { useResolvedElement };
