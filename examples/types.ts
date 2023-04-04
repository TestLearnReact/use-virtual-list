import { VisibleItemDescriptor } from '../src/types';

// type TItem = { id: number; height: number };

export interface ISubProps<T> {
	height: number;
	refOuterWrapper: React.MutableRefObject<null>;
	refInnerWrapper: React.MutableRefObject<null>;
	containerStyles: any;
	visibleItems: VisibleItemDescriptor<T>[];
}
