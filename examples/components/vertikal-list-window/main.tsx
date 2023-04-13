import React from 'react';
import { ISubProps } from '../../types';
import { useVirtualList } from '../../../src';
import { IDataItem } from '../../data';

// const isItemLoadedArr: boolean[] = [];
// type TLoadData = (
// 	event: LoadMoreEvent,
// 	setComments: React.Dispatch<React.SetStateAction<IDataItem[]>>
// ) => Promise<void>;

// const loadData: TLoadData = async (event, setComments) => {
// 	const { loadIndex, startIndex, stopIndex } = event;

// 	// Set the state of a batch items as `true`
// 	// to avoid the callback from being invoked repeatedly
// 	isItemLoadedArr[loadIndex] = true;

// 	try {
// 		//debugger;
// 		// const { data: comments } = await axios(`/comments?postId=${loadIndex + 1}`);
// 		const comments = data.slice(startIndex, stopIndex + 1);
// 		console.log('SET SET');

// 		setComments((prevComments) => {
// 			const nextComments = [...prevComments];
// 			//const nextComments = [];

// 			comments.forEach((comment) => {
// 				nextComments[comment.id] = comment;
// 			});

// 			return nextComments;
// 		});
// 	} catch (err) {
// 		// If there's an error set the state back to `false`
// 		isItemLoadedArr[loadIndex] = false;
// 		// Then try again
// 		loadData(event, setComments);
// 	}
// };

export const VerticalListWindow: React.FC<ISubProps<IDataItem>> = ({
	listHeight,
	listWidth,
	data,
}) => {
	const {
		visibleItems,
		containerStyles,
		msDataRef,
		refOuter: refOuterWrapper,
		refInner: refInnerWrapper,
	} = useVirtualList<IDataItem, HTMLDivElement, HTMLDivElement>({
		viewportHeight: 100,
		viewportWidth: 100,
		itemSize: 280,
		listSize: 843, //listWidth,
		listDirection: 0,
		overscan: 1,
		useWindowScroll: true,
		items: data,
	});

	console.log('rerender: ', containerStyles, visibleItems);

	return (
		<div
			style={{
				height: Math.max(containerStyles.innerContainerStyle.totalSize, 601),
			}}
		>
			<div
				ref={refInnerWrapper}
				className="_inner"
				style={{
					position: 'relative',
					top: 60,
					left: 60,
					width: '100%',
					minHeight: '100%',
					height: Math.max(containerStyles.innerContainerStyle.totalSize, 601),
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
			<div
				ref={refOuterWrapper}
				className="_outer"
				style={{
					position: 'fixed',
					top: 60,
					left: 60,
					height: '90%',
					width: '100%',
					backgroundColor: 'beige',
					scrollbarWidth: 'none',
					visibility: 'collapse',
				}}
			></div>
		</div>
	);
};
