import { useEffect, useRef, useState } from 'react';
import { getFirstArrItem, getLastArrItem } from '../../utils';
import { IProps, IReturnContainerStyles } from './types';

type IDomRect = Omit<DOMRect, 'y' | 'x' | 'toJSON'>;

const initDomRect: IDomRect = {
	height: 0,
	width: 0,
	top: 0,
	bottom: 0,
	left: 0,
	right: 0,
};

export const useContainerStyle = <
	O extends HTMLElement = HTMLElement,
	I extends HTMLElement = O
>({
	msDataRef,
	cache,
	itemsLength,
	refOuterContainer,
	refInnerContainer,
	_sizeKey,
}: IProps<O, I>): IReturnContainerStyles => {
	const refResize = useRef(false);
	const refOuterState = useRef(initDomRect);
	const refhookReturn = useRef({
		outerContainerStyle: refOuterState.current,
		innerContainerStyle: {
			innerMargin: 0,
			totalSize: 0,
			innerSize: refInnerContainer.current?.offsetHeight || 0,
			heightInner: -1,
			widthInner: -1,
		},
	});

	useEffect(() => {
		if (!refOuterContainer.current) return;
		const rect = refOuterContainer.current.getBoundingClientRect();

		refResize.current = false;
		if (
			rect[_sizeKey] !== refOuterState.current[_sizeKey] &&
			cache.visibleItemRange[0] !== -1
		) {
			refResize.current = true;
		}

		refOuterState.current = rect;
	}, [
		refOuterContainer,
		refOuterContainer.current?.offsetWidth,
		refOuterContainer.current?.offsetHeight,
		_sizeKey,
		cache.visibleItemRange,
	]);

	useEffect(() => {
		let innerMargin = 0;
		let totalSize = 0;
		let innerSize = 0;

		// no cache.visibleItemRange are set on init. Dont want render/setState for such simple values
		if (cache.visibleItemRange[0] == -1) {
			totalSize = msDataRef.current[msDataRef.current.length - 1].end;
		}

		const lastVisibleItemOffsets =
			msDataRef.current[getLastArrItem(cache.visibleItemRange)];

		if (lastVisibleItemOffsets) {
			innerMargin =
				msDataRef.current[getFirstArrItem(cache.visibleItemRange)]?.start || 0;

			totalSize = Math[
				getLastArrItem(cache.visibleItemRange) < itemsLength ? 'max' : 'min'
			](
				lastVisibleItemOffsets.end, //+ lastVisibleItemOffsets.size, // todo
				getLastArrItem(msDataRef.current).end
			);
		}
		innerSize = totalSize - innerMargin;

		refhookReturn.current = {
			innerContainerStyle: {
				innerMargin,
				totalSize,
				innerSize,
				heightInner: -1,
				widthInner: -1,
			},
			outerContainerStyle: refOuterState.current,
		};
	}, [cache.visibleItemRange, itemsLength, msDataRef]);

	return {
		containerStyles: refhookReturn.current,
		measured: 0,
		_resize: refResize.current,
	};
};
