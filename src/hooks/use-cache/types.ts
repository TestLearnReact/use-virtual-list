// import { LoadMoreEvent } from '../../../types';

import { LoadMoreEvent } from '../../types'; // todo

export type TSetCachValue = <
	T extends keyof TCacheValues,
	K extends TCacheValues[T]
>({
	key,
	value,
}: {
	key: T;
	value: K;
}) => void;

export type TCacheValues = {
	visibleItemRange: number[];
	loadMore: (event: LoadMoreEvent) => void;
	isItemLoaded: (index: number) => boolean;
	prevValues: {
		viewportWidth: number;
		viewportHeight: number;
		prevVStop: number;
	};
	scrollData: {
		scrollOffsetX: number;
		scrollOffsetY: number;
		scrollSpeed: number;
		scrollForward: boolean;
	};
};
