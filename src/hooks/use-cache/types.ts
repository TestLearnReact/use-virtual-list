import { LoadMoreEvent } from '../../types'; // todo
import { IScrollData } from '../use-scroll-offset/types';

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
		prevData: IScrollData;
		currData: IScrollData;
		scrollSpeed: number;
		scrollForward: boolean;
	};
	_loadMore: boolean;
	_timerScrollStop: null | number;
	_isMounted: boolean;
};
