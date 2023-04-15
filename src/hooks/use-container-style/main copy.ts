import { useEffect, useMemo, useRef, useState } from 'react';
import { getFirstArrItem, getLastArrItem } from '../../utils';
import { IProps, IReturnContainerStyles } from './types';

// todo no sense refInner/Outer? maybe for neednewcalc() x/y scroll
type IDomRect = Pick<DOMRect, 'height' | 'width' | 'top' | 'left'>;

const initDomRect: IDomRect = { height: 0, width: 0, top: 0, left: 0 };

export const useContainerStyle = <
	O extends HTMLElement = HTMLElement,
	I extends HTMLElement = O
>({
	msDataRef,
	cache,
	itemsLength,
	refOuterContainer,
	refInnerContainer,
}: IProps<O, I>): IReturnContainerStyles => {
	const {
		height: oHeight,
		width: oWidth,
		top: oTop,
		left: oLeft,
	} = refOuterContainer.current?.getBoundingClientRect() || initDomRect;
	const { height: iHeight, width: iWidth } =
		refInnerContainer.current?.getBoundingClientRect() || initDomRect;

	const [containerStyles, setContainerStyles] = useState({
		outerContainerStyle: {
			height: oHeight,
			width: oWidth,
			top: oTop,
			left: oLeft,
		},
		innerContainerStyle: {
			innerMargin: 0,
			totalSize: 0,
			innerSize: 0,
			heightInner: iHeight,
			widthInner: iWidth,
		},
	});

	function impressionTracker({
		msDataRef,
		cache,
		itemsLength,
		refOuterContainer,
		refInnerContainer,
	}: IProps<O, I>) {
		let innerMargin = 0;
		let totalSize = 0;
		let innerSize = 0;
		let top = 0;
		let left = 0;
		// const height = refOuterContainer.current?.offsetHeight || 0;
		// const width = refOuterContainer.current?.offsetWidth || 0;
		// const heightInner = refInnerContainer.current?.offsetHeight || 0;
		// const widthInner = refInnerContainer.current?.offsetWidth || 0;

		if (refOuterContainer && refOuterContainer.current) {
			const { top: t, left: l } =
				refOuterContainer.current.getBoundingClientRect();
			top = t;
			left = l;
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

		setContainerStyles({
			outerContainerStyle: {
				height: oHeight,
				width: oWidth,
				top,
				left,
			},
			innerContainerStyle: {
				innerMargin,
				totalSize,
				innerSize,
				heightInner: iHeight,
				widthInner: iWidth,
			},
		});

		// return {
		// 	outerContainerStyle: {
		// 		height,
		// 		width,
		// 		top,
		// 		left,
		// 	},
		// 	innerContainerStyle: {
		// 		innerMargin,
		// 		totalSize,
		// 		innerSize,
		// 		heightInner,
		// 		widthInner,
		// 	},
		// };

		// console.log(
		// 	'params',
		// 	refOuterContainer.current?.offsetHeight,
		// 	refInnerContainer.current?.offsetHeight
		// );
		// return;
	}

	const initialTrackingValues = useRef({
		tracker: impressionTracker,
		params: {
			msDataRef,
			cache,
			itemsLength,
			refOuterContainer,
			refInnerContainer,
		},
	});

	// track impression
	useEffect(() => {
		const { tracker, params } = initialTrackingValues.current;
		tracker(params);
	}, [oHeight]); // you get NO eslint warnings for tracker or params

	// // const containerStyles = useMemo(() => {
	// // 	let innerMargin = 0;
	// // 	let totalSize = 0;
	// // 	let innerSize = 0;
	// // 	let top = 0;
	// // 	let left = 0;
	// // 	const height = refOuterContainer.current?.offsetHeight || 0;
	// // 	const width = refOuterContainer.current?.offsetWidth || 0;
	// // 	const heightInner = refInnerContainer.current?.offsetHeight || 0;
	// // 	const widthInner = refInnerContainer.current?.offsetWidth || 0;

	// // 	if (refOuterContainer && refOuterContainer.current) {
	// // 		const { top: t, left: l } =
	// // 			refOuterContainer.current.getBoundingClientRect();
	// // 		top = t;
	// // 		left = l;
	// // 	}

	// // 	const lastVisibleItemOffsets =
	// // 		msDataRef.current[getLastArrItem(cache.visibleItemRange)];

	// // 	if (lastVisibleItemOffsets) {
	// // 		innerMargin =
	// // 			msDataRef.current[getFirstArrItem(cache.visibleItemRange)]?.start || 0;

	// // 		totalSize = Math[
	// // 			getLastArrItem(cache.visibleItemRange) < itemsLength ? 'max' : 'min'
	// // 		](
	// // 			lastVisibleItemOffsets.end, //+ lastVisibleItemOffsets.size, // todo
	// // 			getLastArrItem(msDataRef.current).end
	// // 		);
	// // 	}
	// // 	innerSize = totalSize - innerMargin;

	// // 	return {
	// // 		outerContainerStyle: {
	// // 			height: oHeight,
	// // 			width: oWidth,
	// // 			top,
	// // 			left,
	// // 		},
	// // 		innerContainerStyle: {
	// // 			innerMargin,
	// // 			totalSize,
	// // 			innerSize,
	// // 			heightInner: iHeight,
	// // 			widthInner: iWidth,
	// // 		},
	// // 	};
	// // }, [
	// // 	cache.visibleItemRange,
	// // 	itemsLength,
	// // 	msDataRef,
	// // 	refInnerContainer,
	// // 	refOuterContainer,
	// // 	//refOuterContainer.current?.offsetHeight,
	// // 	oHeight,
	// // 	oWidth,
	// // 	iHeight,
	// // 	iWidth,
	// // ]);

	return { containerStyles: containerStyles, measured: 0 };
	// return {
	// 	outerContainerStyle: {
	// 		height: containerStyles.height,
	// 		width: containerStyles.width,
	// 		top: containerStyles.top,
	// 		left: containerStyles.left,
	// 	},
	// 	innerContainerStyle: {
	// 		innerMargin: containerStyles.innerMargin,
	// 		totalSize: containerStyles.totalSize,
	// 		innerSize: containerStyles.innerSize,
	// 		heightInner: containerStyles.heightInner,
	// 		widthInner: containerStyles.widthInner,
	// 	},
	// };
};
// const outerContainerStyle = useMemo<{
//   height: number;
//   width: number;
// }>(() => {
//   let height = refOuterContainer.current?.offsetHeight || 0;
//   let width = refOuterContainer.current?.offsetWidth || 0;

//   return { height, width };
// }, [msDataRef.current, cache.visibleItemRange]);

// const innerContainerStyle = useMemo<{
//   innerMargin: number;
//   innerSize: number;
//   totalSize: number;
//   height: number;
//   width: number;
// }>(() => {
//   let innerMargin = 0;
//   let totalSize = 0;
//   let innerSize = 0;
//   let height = refOuterContainer.current?.offsetHeight || 0;
//   let width = refOuterContainer.current?.offsetWidth || 0;

//   let lastVisibleItemOffsets =
//     msDataRef.current[getLastArrItem(cache.visibleItemRange)];

//   if (lastVisibleItemOffsets) {
//     innerMargin =
//       msDataRef.current[getFirstArrItem(cache.visibleItemRange)]?.start || 0;

//     totalSize = Math[
//       getLastArrItem(cache.visibleItemRange) < itemsLength ? 'max' : 'min'
//     ](
//       lastVisibleItemOffsets.end, //+ lastVisibleItemOffsets.size, // todo
//       getLastArrItem(msDataRef.current).end,
//     );
//   }
//   innerSize = totalSize - innerMargin;

//   return { innerMargin, innerSize, totalSize, height, width };
// }, [msDataRef.current, cache.visibleItemRange]);

// return { outerContainerStyle, innerContainerStyle };

// const [containerStyle, setContainerStyle] = useState<{
//   outerContainerStyle: {
//     height: number;
//     width: number;
//   };
//   innerContainerStyle: {
//     innerMargin: number;
//     innerSize: number;
//     totalSize: number;
//   };
// }>({
//   outerContainerStyle: {
//     height: 0,
//     width: 0,
//   },
//   innerContainerStyle: {
//     innerMargin: 0,
//     innerSize: 0,
//     totalSize: 0,
//   },
// });

// useEffect(() => {
//   let innerMargin = 0;
//   let totalSize = 0;
//   let innerSize = 0;
//   let height = refOuterContainer.current?.offsetHeight || 0;
//   let width = refOuterContainer.current?.offsetWidth || 0;

//   let lastVisibleItemOffsets =
//     msDataRef.current[getLastArrItem(cache.visibleItemRange)];

//   if (lastVisibleItemOffsets) {
//     innerMargin =
//       msDataRef.current[getFirstArrItem(cache.visibleItemRange)]?.start || 0;

//     totalSize = Math[
//       getLastArrItem(cache.visibleItemRange) < itemsLength ? 'max' : 'min'
//     ](
//       lastVisibleItemOffsets.end, //+ lastVisibleItemOffsets.size, // todo
//       getLastArrItem(msDataRef.current).end,
//     );
//   }
//   innerSize = totalSize - innerMargin;

//   setContainerStyle({
//     outerContainerStyle: {
//       height: height,
//       width: width,
//     },
//     innerContainerStyle: {
//       innerMargin: innerMargin,
//       totalSize: totalSize,
//       innerSize: innerSize,
//     },
//   });

//   // return { innerMargin, innerSize, totalSize, height, width };
// }, [
//   msDataRef.current,
//   cache.visibleItemRange,
//   refOuterContainer.current,
//   refInnerContainer.current,
// ]);

// return {
//   outerContainerStyle: containerStyle.outerContainerStyle,
//   innerContainerStyle: containerStyle.innerContainerStyle,
// };

// const [stateStyle, setStateStyle] = useState<{
//   outerContainerStyle: {
//     height: number;
//     width: number;
//   };
//   innerContainerStyle: {
//     innerMargin: number;
//     innerSize: number;
//     totalSize: number;
//     heightInner: number;
//     widthInner: number;
//   };
// }>({
//   outerContainerStyle: {
//     height: 0,
//     width: 0,
//   },
//   innerContainerStyle: {
//     innerMargin: 0,
//     innerSize: 0,
//     totalSize: 0,
//     heightInner: 0,
//     widthInner: 0,
//   },
// });

// const containerStyles = useMemo<{
//   innerMargin: number;
//   innerSize: number;
//   totalSize: number;
//   height: number;
//   width: number;
//   heightInner: number;
//   widthInner: number;
// }>(() => {
//   let innerMargin = 0;
//   let totalSize = 0;
//   let innerSize = 0;
//   let height = refOuterContainer.current?.offsetHeight || 0;
//   let width = refOuterContainer.current?.offsetWidth || 0;
//   let heightInner = refInnerContainer.current?.offsetHeight || 0;
//   let widthInner = refInnerContainer.current?.offsetWidth || 0;

//   console.log('heightInner,widthInner', heightInner, widthInner);

//   let lastVisibleItemOffsets =
//     msDataRef.current[getLastArrItem(cache.visibleItemRange)];

//   if (lastVisibleItemOffsets) {
//     innerMargin =
//       msDataRef.current[getFirstArrItem(cache.visibleItemRange)]?.start || 0;

//     totalSize = Math[
//       getLastArrItem(cache.visibleItemRange) < itemsLength ? 'max' : 'min'
//     ](
//       lastVisibleItemOffsets.end, //+ lastVisibleItemOffsets.size, // todo
//       getLastArrItem(msDataRef.current).end,
//     );
//   }
//   innerSize = totalSize - innerMargin;

//   setStateStyle({
//     outerContainerStyle: { height, width },
//     innerContainerStyle: {
//       innerMargin,
//       innerSize,
//       totalSize,
//       heightInner,
//       widthInner,
//     },
//   });

//   return {
//     innerMargin,
//     innerSize,
//     totalSize,
//     height,
//     width,
//     heightInner,
//     widthInner,
//   };
// }, [
//   msDataRef.current,
//   cache.visibleItemRange,
//   // refOuterContainer.current,
//   // refInnerContainer.current?.offsetWidth,
//   // refInnerContainer.current?.offsetHeight,
// ]);

// return {
//   outerContainerStyle: {
//     height: stateStyle.outerContainerStyle.height,
//     width: stateStyle.outerContainerStyle.width,
//   },
//   innerContainerStyle: {
//     innerMargin: stateStyle.innerContainerStyle.innerMargin,
//     totalSize: stateStyle.innerContainerStyle.totalSize,
//     innerSize: stateStyle.innerContainerStyle.innerSize,
//     heightInner: stateStyle.innerContainerStyle.heightInner,
//     widthInner: stateStyle.innerContainerStyle.widthInner,
//   },
// };
