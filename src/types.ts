import { CSSProperties, RefCallback, RefObject } from 'react';

export interface IHookReturn<
	ItemType,
	O extends HTMLElement = HTMLElement,
	I extends HTMLElement = O
> {
	// // onScroll: UIEventHandler;
	getMeasuredItem: MeasuredItemGetter; // ItemOffsetGetter;
	scrollingSpeed: number;
	refOuter: RefCallback<O>;
	refInner: RefCallback<I>;
	visibleItems: VisibleItemDescriptor<ItemType>[];
	containerStyles: {
		outer: { height: number; width: number };
		inner: { innerMargin: number; innerSize: number; totalSize: number };
	};
	msDataRef: Measure[];
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
	listDirection: Direction;
	//style: CSSProperties;
};

export interface LoadMoreEvent {
	startIndex: number;
	stopIndex: number;
	loadIndex: number;
	readonly scrollOffset: number;
	readonly userScroll: boolean;
}

export interface IVirtualListProps<
	ItemType,
	O extends HTMLElement = HTMLElement,
	I extends HTMLElement = O
> {
	viewportHeight: number;
	viewportWidth: number;
	xouterRef?: RefObject<O> | O | null | undefined;
	xinnerRef?: RefObject<I> | I | null | undefined;
	items: ItemType[];
	itemSize: number | ItemSizeGetter<ItemType>;
	listSize?: number;
	listDirection?: Direction;
	overscan?: number;
	isItemLoaded: (index: number) => boolean;
	loadMoreCount: number;
	loadMore: (event: LoadMoreEvent) => void;
	useWindowScroll?: boolean;
}
