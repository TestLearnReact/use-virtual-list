import { MutableRefObject } from 'react';
import { Direction, Measure } from '../types';
import { TCacheValues } from '../hooks';
// import { TCacheValues } from '../../hooks/custom-hooks/use-cache/types';
// import { Measure } from '../../types';

export function needNewCalcVisbleRange<
	O extends HTMLElement = HTMLElement,
	I extends HTMLElement = O
>({
	msDataRef,
	cache,
	///refInnerContainer,
	refOuterContainer,
	totalSize,
	useWindowScroll,
	listDirection,
}: {
	msDataRef: MutableRefObject<Measure[]>;
	cache: TCacheValues;
	///refInnerContainer: React.MutableRefObject<I | undefined>; // todo check type / size as parameter
	refOuterContainer: React.RefObject<HTMLElement | undefined>; //React.MutableRefObject<O | undefined>; // todo check type / size as parameter
	totalSize: number;
	useWindowScroll: boolean;
	listDirection: Direction;
}) {
	// direction / overscan
	// const sizeStyleProp =
	//   listDirection === Direction.Vertical ? 'height' : 'width';
	//debugger;
	const {
		visibleItemRange,
		scrollData: { scrollForward, scrollOffsetY, scrollOffsetX },
	} = cache;

	const scrollOffset =
		listDirection === Direction.Vertical ? scrollOffsetY : scrollOffsetX;

	const first = msDataRef.current[visibleItemRange[0]];
	const last =
		msDataRef.current[cache.visibleItemRange[visibleItemRange.length - 1]];

	const veryFirst = msDataRef.current[0];
	const veryLast = msDataRef.current[msDataRef.current.length - 1];

	const listHeight = refOuterContainer.current?.offsetHeight || 0;
	const listWidth = refOuterContainer.current?.offsetWidth || 0;

	const listSize =
		listDirection === Direction.Vertical ? listHeight : listWidth;

	let rect = { top: 0, left: 0 }; // todo getBoundingClientRect() outer wrapper x,y scroll
	if (useWindowScroll) rect = { top: 60, left: 0 };

	// if (scrollOffsetY < rect.top) {
	// 	return false;
	// }
	if (scrollOffset < rect.top) {
		return false;
	}

	// let needNewCalc = false;
	let needNewCalc = true;

	// if (scrollOffset >= 750) debugger;

	// scroll down
	if (scrollForward) {
		// if (last.idx == veryLast.idx) return false;

		switch (true) {
			// last visible item changed
			//			case scrollOffsetY + listHeight > last.start && last.idx !== veryLast.idx:
			case scrollOffset + listSize > last.start && last.idx !== veryLast.idx:
				//debugger;
				break;
			// first visible item changed
			//case scrollOffsetY - first.size > first.end:
			case scrollOffset - first.size > first.end:
				//debugger;
				break;
			// edge case, container size bigger than totalsize
			//case scrollOffsetY > totalSize:
			case scrollOffset > totalSize:
				//debugger;
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
			//			case scrollOffsetY < first.end && first.idx !== veryFirst.idx:
			case scrollOffset < first.end && first.idx !== veryFirst.idx:
				break;
			// last visible item changed
			//case scrollOffsetY + listHeight < last.start - last.size:
			case scrollOffset + listSize < last.start - last.size:
				break;
			default:
				needNewCalc = false;
				break;
		}
	}

	return needNewCalc;
}
