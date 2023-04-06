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

export interface IScrollOffsetProps {
	effect: (props: {
		prevData: { x: number; y: number; timestamp: number };
		currData: { x: number; y: number; timestamp: number };
	}) => void;
	scrollWindowOrElement: IWindowOrElement;
	wait?: number;
	deps?: DependencyList;
}
