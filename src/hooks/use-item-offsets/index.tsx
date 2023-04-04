import { useEffect, useRef, useState } from 'react';
import { ItemSizeGetter, Measure } from '../../types';
import { isNumber } from '../../utils';
// import { ItemSizeGetter, Measure } from '../../../types';
// import { isNumber } from '../../../utils';

export function useItemOffsets<ItemType>({
	items,
	itemSize,
}: {
	items: ItemType[];
	itemSize: number | ItemSizeGetter<ItemType>;
}) {
	const [itemOffsets, setItemOffsets] = useState<number[]>([]);
	const [itemsSnapshotSignature, setItemsSnapshotSignature] = useState(
		Math.random().toString(32)
	);
	// memory storage measured values
	const msDataRef = useRef<Measure[]>([{ idx: 0, start: 0, end: 0, size: 0 }]); //

	useEffect(() => {
		// debugger;
		// todo ssr
		setItemsSnapshotSignature(Math.random().toString(32));

		let nextItemOffsets: number[] = [];
		let itemOffsetsDidChange =
			items.length !== itemOffsets.length && items.length > 1; // todo items.length

		if (items.length > 0) {
			nextItemOffsets = [0];

			if (isNumber(itemSize)) {
				for (let itemIndex = 1; itemIndex < items.length; itemIndex++) {
					const prevItemOffset = nextItemOffsets[itemIndex - 1];

					const start = prevItemOffset + itemSize;
					const size = itemSize;
					const end = start + size;

					nextItemOffsets.push(start);
					msDataRef.current[itemIndex] = { idx: itemIndex, start, end, size };
				}
				itemOffsetsDidChange =
					nextItemOffsets[items.length - 1] !== itemOffsets[items.length - 1];
			}

			if (typeof itemSize === 'function') {
				for (let itemIndex = 1; itemIndex < items.length; itemIndex++) {
					const prevItemOffset = nextItemOffsets[itemIndex - 1];

					const start = prevItemOffset + itemSize(items[itemIndex - 1]);
					const size = itemSize(items[itemIndex]);
					const end = start + size;

					nextItemOffsets.push(start);
					msDataRef.current[itemIndex] = { idx: itemIndex, start, end, size };

					// todo better check first/last outside for (resize item?)
					if (nextItemOffsets[itemIndex] !== itemOffsets[itemIndex]) {
						itemOffsetsDidChange = true;
					}
				}
			}

			msDataRef.current[0] = {
				idx: 0,
				start: 0,
				end: isNumber(itemSize) ? itemSize : itemSize(items[0]),
				size: isNumber(itemSize) ? itemSize : itemSize(items[0]),
			};

			if (itemOffsetsDidChange) {
				setItemOffsets(nextItemOffsets);
			}
		}
	}, [items, items.length]);

	return {
		itemOffsets,
		itemsSnapshotSignature,
		msDataRef,
		totalSize: msDataRef.current[msDataRef.current.length - 1]?.end || 0,
	};
}

// items.forEach((item, itemIndex) => {
//   const prevItem = items[itemIndex - 1];
//   const prevItemOffset = nextItemOffsets[itemIndex - 1] || 0;
//   //debugger;
//   const start = itemIndex > 0 ? prevItemOffset + itemSize : 0; // ? prevItemOffset + itemSize : 0;
//   const size = itemSize;
//   const end = start + size;

//   nextItemOffsets.push(start);
//   msDataRef.current[itemIndex] = { idx: itemIndex, start, end, size };
// });

// todo function ? can be number
// items.forEach((item, itemIndex) => {
//   const prevItem = items[itemIndex - 1];
//   const prevItemOffset = nextItemOffsets[itemIndex - 1];
//   debugger;
//   nextItemOffsets.push(
//     prevItem ? prevItemOffset + itemSize(prevItem) : 0,
//   );

//   // const start = msDataRef.current[itemIndex - 1]?.end ?? 0;
//   // const size =
//   //   msDataRef.current[itemIndex]?.size ||
//   //   (isNumber(itemSize) ? itemSize : itemSize(item));
//   // const end = start + size;
//   const start = prevItem ? prevItemOffset + itemSize(prevItem) : 0;
//   const size = isNumber(itemSize) ? itemSize : itemSize(item);
//   const end = start + size;

//   msDataRef.current[itemIndex] = { idx: itemIndex, start, end, size };

//   // min = size < min ? size : min;
//   // max = size > max ? size : max;

//   if (size < min) minIndex = itemIndex;
//   if (size > max) maxIndex = itemIndex;

//   if (nextItemOffsets[itemIndex] !== itemOffsets[itemIndex]) {
//     itemOffsetsDidChange = true;
//   }
//   lastItemIndex = itemIndex;
// });
