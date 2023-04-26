import { CSSProperties, RefCallback, RefObject, UIEventHandler } from 'react';
import { IContainerStyle, IReturnContainerStyles } from './hooks';

export interface IHookReturn<
	ItemType,
	O extends HTMLElement = HTMLElement,
	I extends HTMLElement = O
> {
	// onScroll: UIEventHandler;
	getMeasuredItem: MeasuredItemGetter; // ItemOffsetGetter;
	scrollingSpeed: number;
	refOuter: RefObject<O> | null | undefined; //React.MutableRefObject<O | undefined>// RefCallback<O>; | O
	refInner: RefObject<I> | null | undefined; //React.MutableRefObject<O | undefined>// RefCallback<I>; | I
	visibleItems: VisibleItemDescriptor<ItemType>[];
	containerStyles: IReturnContainerStyles['containerStyles'];
	msDataRef: Measure[];
	isFetching: boolean;
}

export interface Measure {
	idx: number;
	start: number;
	end: number;
	size: number;
}

export type Range = {
	startIndex: number;
	endIndex: number;
};

export type ItemSizeGetter<ItemType> = (item: ItemType) => number;

export type ItemOffsetGetter = (itemIndex: number) => number;
export type MeasuredItemGetter = (itemIndex: number) => Measure;

export enum Direction {
	Vertical,
	Horizontal,
}

export type VisibleItemDescriptor<ItemType> = {
	item: ItemType;
	itemIndex: number;
	size: number;
	offset: number;
	//listDirection: Direction;
	//style: CSSProperties;
};

export interface OnScrollEvent {
	// readonly scrollOffsetX: number;
	// readonly scrollOffsetY: number;
	// readonly scrollSpeed: number;
	// readonly scrollForward: boolean;
	currData: {
		x: number;
		y: number;
		timestamp: number;
	};
	prevData: {
		x: number;
		y: number;
		timestamp: number;
	};
}

export interface LoadMoreEvent {
	startIndex: number;
	stopIndex: number;
	loadIndex: number;
	readonly scrollOffset: number;
	readonly userScroll: boolean;
}

export type LoadMoreReturn = { hasFetchedMore: boolean };

export type LoadMoreType = {
	isItemLoaded: (index: number) => boolean;
	loadMoreCount: number;
	// loadMore: (event: LoadMoreEvent) => void;
	loadMore: (event: LoadMoreEvent) => Promise<LoadMoreReturn>;
};

export interface IVirtualListProps<
	ItemType,
	O extends HTMLElement = HTMLElement,
	I extends HTMLElement = O
> {
	// viewportHeight: number;
	// viewportWidth: number;
	xouterRef?: RefObject<O> | null | undefined; //| O
	xinnerRef?: RefObject<I> | null | undefined; //| I
	items: ItemType[];
	itemSize: number | ItemSizeGetter<ItemType>;
	// listSize?: number;
	listDirection?: Direction;
	overscan?: number;
	useWindowScroll?: boolean;
	loadMoreProps?: LoadMoreType;
	waitScroll?: number;
	onScroll: (event: OnScrollEvent) => void;
}
