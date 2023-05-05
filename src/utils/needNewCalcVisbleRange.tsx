import { MutableRefObject } from 'react';
import { Direction, Measure } from '../types';
import { IReturnContainerStyles, TCacheValues } from '../hooks';

export function needNewCalcVisbleRange<ItemType>({
	msDataRef,
	cache,
	useWindowScroll,
	listDirection,
	containerStyles,

	itemOffsets,
	items,
}: {
	msDataRef: MutableRefObject<Measure[]>;
	cache: TCacheValues;
	useWindowScroll: boolean;
	listDirection: Direction;
	containerStyles: IReturnContainerStyles['containerStyles'];
	itemOffsets: number[];
	items: ItemType[];
}) {
	if (
		// general rules, scroll independent
		itemOffsets.length <= 0 ||
		!items[0] ||
		msDataRef.current.length < items.length
	) {
		return false;
	}

	const {
		visibleItemRange,
		scrollData: { scrollForward, scrollOffsetY, scrollOffsetX },
	} = cache;

	const {
		outerContainerStyle: { height: listHeight, width: listWidth, left, top },
		innerContainerStyle: { totalSize },
	} = containerStyles;

	let scrollOffset = scrollOffsetY;
	let listSize = listHeight;
	let topLeftpos = top;

	if (listDirection === Direction.Horizontal) {
		scrollOffset = scrollOffsetX;
		listSize = listWidth;
		topLeftpos = left;
	}

	const first = msDataRef.current[visibleItemRange[0]];
	const last =
		msDataRef.current[cache.visibleItemRange[visibleItemRange.length - 1]];

	const veryFirst = msDataRef.current[0];
	const veryLast = msDataRef.current[msDataRef.current.length - 1];

	if (useWindowScroll && scrollOffset < topLeftpos) {
		return false;
	}

	let needNewCalc = true;

	// scroll down
	if (scrollForward) {
		// if (last.idx == veryLast.idx) return false;
		switch (true) {
			// last visible item changed
			case scrollOffset + listSize > last.start && last.idx !== veryLast.idx:
				break;
			// first visible item changed
			case scrollOffset - first.size > first.end:
				break;
			// edge case, container size bigger than totalsize
			case scrollOffset > totalSize:
				break;
			default:
				needNewCalc = false;
				break;
		}
	}

	// scroll up
	if (!scrollForward) {
		//if (first.idx == veryFirst.idx) return false;
		switch (true) {
			// first visible item changed
			case scrollOffset < first.end && first.idx !== veryFirst.idx:
				break;
			// last visible item changed
			case scrollOffset + listSize < last.start - last.size:
				//debugger;
				break;
			default:
				needNewCalc = false;
				break;
		}
	}

	return needNewCalc;
}
