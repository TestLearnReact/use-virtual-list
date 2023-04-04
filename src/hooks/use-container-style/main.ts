import { useMemo } from 'react';
import { TCacheValues } from '../use-cache/types';
import { Measure } from '../../types';
import { getFirstArrItem, getLastArrItem } from '../../utils';

export const useContainerStyle = <
	O extends HTMLElement = HTMLElement,
	I extends HTMLElement = O
>({
	msDataRef,
	cache,
	itemsLength,
	refOuterContainer,
	refInnerContainer,
}: {
	msDataRef: React.MutableRefObject<Measure[]>;
	cache: TCacheValues;
	itemsLength: number;
	refOuterContainer: React.MutableRefObject<O | undefined>;
	refInnerContainer: React.MutableRefObject<I | undefined>;
}) => {
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

	const containerStyles = useMemo<{
		innerMargin: number;
		innerSize: number;
		totalSize: number;
		height: number;
		width: number;
		heightInner: number;
		widthInner: number;
	}>(() => {
		let innerMargin = 0;
		let totalSize = 0;
		let innerSize = 0;
		const height = refOuterContainer.current?.offsetHeight || 0;
		const width = refOuterContainer.current?.offsetWidth || 0;
		const heightInner = refInnerContainer.current?.offsetHeight || 0;
		const widthInner = refInnerContainer.current?.offsetWidth || 0;

		//console.log('heightInner,widthInner', heightInner, widthInner);

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

		return {
			innerMargin,
			innerSize,
			totalSize,
			height,
			width,
			heightInner,
			widthInner,
		};
	}, [
		msDataRef.current,
		cache.visibleItemRange,
		refOuterContainer.current,
		refInnerContainer.current?.offsetWidth,
		refInnerContainer.current?.offsetHeight,
	]);

	return {
		outerContainerStyle: {
			height: containerStyles.height,
			width: containerStyles.width,
		},
		innerContainerStyle: {
			innerMargin: containerStyles.innerMargin,
			totalSize: containerStyles.totalSize,
			innerSize: containerStyles.innerSize,
			heightInner: containerStyles.heightInner,
			widthInner: containerStyles.widthInner,
		},
	};
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
