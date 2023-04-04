import { useRef } from 'react';
import { useIsomorphicLayoutEffect } from '../';
import { IScrollOffsetProps } from './types';

const isBrowser = typeof window !== 'undefined';

export const useScrollOffset = ({
	effect,
	scrollWindowOrElement,
	deps = [],
	wait,
}: IScrollOffsetProps) => {
	const throttleInProgress = useRef(false);
	const prevData = useRef({
		x: 0,
		y: 0,
		timestamp: 0,
	});

	const { useWindowScroll, element } = scrollWindowOrElement;

	let xy = { x: 0, y: 0 };
	let x = 0;
	let y = 0;

	// todo usecallback
	//const callBack = ({ x, y }: { x: number; y: number }) => {
	const callBack = () => {
		if (scrollWindowOrElement.useWindowScroll) {
			xy = { x: window.scrollX, y: window.scrollY };
			x = window.scrollX;
			y = window.scrollY;
		}
		if (element?.current) {
			xy = {
				x: element?.current.scrollLeft,
				y: element?.current.scrollTop,
			};
			x = element?.current.scrollLeft;
			y = element?.current.scrollTop;
		}

		effect({
			prevData: prevData.current,
			currData: { x, y, timestamp: Date.now() },
		});

		prevData.current = {
			x,
			y,
			timestamp: Date.now(),
		};

		throttleInProgress.current = false;
	};

	useIsomorphicLayoutEffect(() => {
		if (!isBrowser || (!useWindowScroll && !element?.current)) {
			return undefined;
		}

		const handleScroll = ({ target }: Event) => {
			if (throttleInProgress.current) {
				return;
			}

			if (wait) {
				throttleInProgress.current = true;

				setTimeout(() => {
					callBack();
				}, wait);
			} else {
				callBack();
			}
		};

		if (element) {
			element.current?.addEventListener('scroll', handleScroll, {
				passive: true,
			});
		} else {
			window.addEventListener('scroll', handleScroll, {
				passive: true,
			});
		}

		return () => {
			if (element) {
				element.current?.removeEventListener('scroll', handleScroll);
			} else {
				window.removeEventListener('scroll', handleScroll);
			}
		};
	}, [deps]);
};
