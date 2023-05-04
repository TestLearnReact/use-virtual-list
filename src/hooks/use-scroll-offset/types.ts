import { DependencyList, MutableRefObject } from 'react';

type IWindowOrElement =
	| {
			element: React.RefObject<HTMLElement | undefined>; // MutableRefObject<HTMLElement | undefined>;
			useWindowScroll?: never;
	  }
	| {
			element?: never;
			useWindowScroll: boolean;
	  };

export type IScrollData = { x: number; y: number; timestamp: number };

export interface IScrollOffsetProps {
	effect: (props: { prevData: IScrollData; currData: IScrollData }) => void;
	scrollWindowOrElement: IWindowOrElement;
	wait?: number;
	deps?: DependencyList;
}
