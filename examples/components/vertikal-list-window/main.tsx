import React, { useCallback, useRef, useState } from 'react';
import { ISubProps } from '../../types';
import { LoadMoreEvent, LoadMoreReturn, useVirtualList } from '../../../src';
import { IDataItem } from '../../data';

const isItemLoadedArr: boolean[] = [];

type TLoadData = (
	event: LoadMoreEvent,
	setData: React.Dispatch<React.SetStateAction<IDataItem[]>>
) => Promise<LoadMoreReturn>;

export const VerticalListWindow: React.FC<ISubProps<IDataItem>> = ({
	data: inputData,
}) => {
	const [dataFetched, setDataFetched] = useState<IDataItem[]>([]);
	const [speed, setSpeed] = useState<number>(0);

	const refSpeedBigger = useRef<boolean>(false);

	const loadData: TLoadData = useCallback(
		async (event, setData) => {
			const { loadIndex, startIndex, stopIndex } = event;

			isItemLoadedArr[loadIndex] = true;
			try {
				const dataFetched = inputData.slice(startIndex, stopIndex + 1);

				if (dataFetched.length <= 0) {
					isItemLoadedArr[loadIndex] = false;
					return { hasFetchedMore: false };
				}

				setData((prevData) => {
					const nextComments = [...prevData];
					dataFetched.forEach((item) => {
						nextComments[item.id] = item;
					});
					return nextComments;
				});

				console.log('SET SET', startIndex, stopIndex + 1, loadIndex);

				return { hasFetchedMore: true };
			} catch (err) {
				isItemLoadedArr[loadIndex] = false;
				loadData(event, setData);
				return { hasFetchedMore: false };
			}
		},
		[inputData]
	);

	const {
		visibleItems,
		containerStyles,
		refOuter: refOuterWrapper,
		refInner: refInnerWrapper,
		isFetching,
		scrollingSpeed,
	} = useVirtualList<IDataItem, HTMLDivElement, HTMLDivElement>({
		itemSize: 100,
		listDirection: 0,
		overscan: 1,
		useWindowScroll: true,
		items: dataFetched,
		loadMoreProps: {
			loadMoreCount: 40,
			isItemLoaded: (i) => {
				return (
					//dataFetched.length >= 100 ||
					isItemLoadedArr && isItemLoadedArr[i] == true
				);
			},
			loadMore: async (event) => {
				return await loadData(event, setDataFetched);
			},
		},
		onScroll: (e) => {
			//console.log(e.currData.y);
			if (e.scrollSpeed > 12 && !refSpeedBigger.current) {
				refSpeedBigger.current = true;
				setSpeed(e.scrollSpeed);
			}
			if (e.scrollSpeed <= 12 && refSpeedBigger.current) {
				refSpeedBigger.current = false;
			}
		},
		waitScroll: 40,
		//scrollSpeedSkip: 12,
		skipRenderProps: { scrollSpeedSkip: 12, waitRender: 400 },
	});

	if (isFetching) return null;

	const shouldRender =
		!isFetching && containerStyles.innerContainerStyle.totalSize > 0; // &&

	console.log('rerender: ', visibleItems, scrollingSpeed);

	return (
		<>
			<div
				ref={refOuterWrapper}
				className="_outer"
				style={{
					position: 'absolute',
					height: '100vh',
					marginLeft: 0,
					top: 60,
					left: 60,
					right: 0,
					overflow: 'inherit',
					willChange: 'transform',
					WebkitOverflowScrolling: 'touch',
					backgroundColor: 'beige',
				}}
			>
				<div
					ref={refInnerWrapper}
					className="_inner"
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						height: containerStyles.innerContainerStyle.totalSize,
						width: '100%',
						backgroundColor: refSpeedBigger.current ? 'beige' : 'white',
					}}
				>
					{shouldRender ? (
						visibleItems.map((item) => {
							return (
								<div
									key={item.item.id}
									style={{
										position: 'absolute',
										top: item.offset,
										paddingLeft: 0,
										height: item.size,
									}}
								>
									{item.item.id}
								</div>
							);
						})
					) : (
						<div
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								height: containerStyles.innerContainerStyle.totalSize,
								width: '100%',
								backgroundColor: 'black',
							}}
						>
							SCROLL...
						</div>
					)}
				</div>
			</div>
		</>
	);
};
