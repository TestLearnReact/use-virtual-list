// import { range } from 'lodash/fp';

import { ItemSizeGetter, Range } from '../types';
import { range } from './utils';

//const extendItemRange = (size: number, limit: number, range: Range): Range => {
const extendItemRange = (
	overscan: number,
	itemCount: number,
	range: Range
): Range => {
	const startIndex = Math.max(0, range.startIndex - overscan);
	const endIndex = Math.min(itemCount, range.endIndex + overscan);

	return {
		startIndex,
		endIndex,
	};
};

const findItemIndexByScrollOffset = (
	itemCount: number,
	itemOffsets: number[],
	scrollOffset: number
) => {
	let start = 0;
	let end = itemCount;
	let middle = Math.floor((start + end) / 2);

	while (
		middle !== end &&
		middle !== start &&
		itemOffsets[middle] !== scrollOffset
	) {
		if (itemOffsets[middle] > scrollOffset) {
			end = middle;
		} else {
			start = middle;
		}

		middle = Math.floor((start + end) / 2);
	}

	return middle;
};

export function getVisibleItemsRange<ItemType>(
	listSize: number,
	itemSize: number | ItemSizeGetter<ItemType>,
	scrollOffset: number,
	itemOffsets: number[],
	scrollForward: boolean
): Range {
	if (typeof itemSize === 'number') {
		const startIndex = Math.floor(scrollOffset / itemSize);
		let visibleItemCount =
			Math.ceil(listSize / itemSize) + (scrollOffset % itemSize === 0 ? 0 : 1);

		if (!scrollForward)
			visibleItemCount =
				Math.floor(listSize / itemSize) +
				(scrollOffset % itemSize === 0 ? 0 : 1);

		return {
			startIndex,
			endIndex: startIndex + visibleItemCount,
		};
	}

	const startIndex = findItemIndexByScrollOffset(
		itemOffsets.length,
		itemOffsets,
		scrollOffset
	);

	let endIndex = startIndex;
	while (itemOffsets[endIndex] < scrollOffset + listSize) {
		endIndex++;
	}

	return {
		startIndex,
		endIndex,
	};
}

export function getExtendedVisibleItemRange<ItemType>(
	listSize: number,
	itemSize: number | ItemSizeGetter<ItemType>,
	itemCount: number,
	scrollOffset: number,
	itemOffsets: number[],
	overscan: number,
	scrollForward: boolean
) {
	const visibleItemsRange = getVisibleItemsRange(
		listSize,
		itemSize,
		scrollOffset,
		itemOffsets,
		scrollForward
	);

	const { startIndex, endIndex } = extendItemRange(
		overscan,
		itemCount,
		visibleItemsRange
	);

	return range(startIndex, endIndex);
}
