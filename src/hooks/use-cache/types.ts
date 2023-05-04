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
	prevViewportWidth?: number;
	prevViewportHeight?: number;
	prevVStop?: number;
	scrollData: {
		scrollOffsetX: number;
		scrollOffsetY: number;
		scrollSpeed: number;
		scrollForward: boolean;
	};
	_loadMore: boolean;
	_timerScrollStop: null | number;
	_isMounted: boolean;
};
