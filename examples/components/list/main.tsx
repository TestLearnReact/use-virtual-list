import React, { MutableRefObject, useCallback, useRef, useState } from 'react';

import { VerticalList } from '../vertical-list';
import { IDataItem, data } from '../../data';
import { LoadMoreEvent } from '../../../src/types'; // todo
import { useVirtualList } from '../../../src';
import { TestHook } from './test';

export const LIST_HEIGHT = 600;
export const LIST_WIDTH = 600;

const isItemLoadedArr: boolean[] = [];
type TLoadData = (
	event: LoadMoreEvent,
	setComments: React.Dispatch<React.SetStateAction<IDataItem[]>>
) => Promise<void>;

const loadData: TLoadData = async (event, setComments) => {
	const { loadIndex, startIndex, stopIndex } = event;

	// Set the state of a batch items as `true`
	// to avoid the callback from being invoked repeatedly
	isItemLoadedArr[loadIndex] = true;

	try {
		//debugger;
		// const { data: comments } = await axios(`/comments?postId=${loadIndex + 1}`);
		const comments = data.slice(startIndex, stopIndex + 1);
		console.log('SET SET');
		setComments((prevComments) => {
			const nextComments = [...prevComments];
			//const nextComments = [];

			comments.forEach((comment) => {
				nextComments[comment.id] = comment;
			});

			return nextComments;
		});
	} catch (err) {
		debugger;
		// If there's an error set the state back to `false`
		isItemLoadedArr[loadIndex] = false;
		// Then try again
		loadData(event, setComments);
	}
};

export const ListTypes: React.FC = () => {
	const refOuterWrapper = useRef(null);
	const refInnerWrapper = useRef(null);

	const [fetchedData, setFetchedData] = useState<IDataItem[]>([]);

	const {
		visibleItems,
		containerStyles,
		// refOuter: refOuterWrapper,
		// refInner: refInnerWrapper,
	} = useVirtualList<IDataItem, HTMLDivElement, HTMLDivElement>({
		viewportHeight: 100,
		viewportWidth: 100,
		xouterRef: refOuterWrapper,
		xinnerRef: refInnerWrapper,
		items: data,
		itemSize: 200,
		listSize: LIST_HEIGHT, //937,
		listDirection: 0,
		overscan: 1, // >=1 todo getVisibleItemsRange needNewCalcVisbleRange
		useWindowScroll: false,
		loadMoreProps: {
			loadMore: (event) => {
				loadData(event, setFetchedData);

				return console.log('LOAD_MORE', event);
			},
			loadMoreCount: 5,
			isItemLoaded: (loadIndex) => {
				const lo =
					isItemLoadedArr[loadIndex] && isItemLoadedArr[loadIndex] == true;
				console.log('isItemLoadedArr[loadIndex]', lo, loadIndex);
				return lo;
			},
		},
	});

	return (
		<>
			<div
				ref={refOuterWrapper}
				style={{
					position: 'fixed',
					top: 60,
					height: LIST_HEIGHT,
					width: LIST_WIDTH,
					overflow: 'auto',
					willChange: 'transform',
					WebkitOverflowScrolling: 'touch',
					backgroundColor: 'beige',
				}}
			>
				<div
					ref={refInnerWrapper}
					style={{
						position: 'relative',
						width: '100%',
						minHeight: '100%',
						height: Math.max(containerStyles.inner.totalSize, 601),
					}}
				>
					{visibleItems.map((item) => (
						<div
							key={item.item.id}
							style={{
								position: 'absolute',
								top: item.offset,
								left: 0,
								height: item.size,
							}}
						>
							{item.item.id}
						</div>
					))}
				</div>
			</div>
			{/* <VerticalList
				visibleItems={visibleItems}
				refInnerWrapper={refInnerWrapper}
				refOuterWrapper={refOuterWrapper}
				containerStyles={containerStyles}
				height={height}
			/> */}
		</>
	);
};

// const height = containerStyles.inner.totalSize;

// const refNode = useCallback((node: HTMLDivElement) => {
// 	console.log('refNode', node);
// }, []);

// const { outerRef, innerRef } = TestHook<HTMLDivElement, HTMLDivElement>();
// // const outerRef: React.MutableRefObject<HTMLDivElement | null>

// const refOuterWrapper = useRef(null);
// const refInnerWrapper = useRef<HTMLDivElement>(null);
// const { outerRef: a } = TestHook({
// 	or: refOuterWrapper,
// 	ir: refInnerWrapper,
// });
