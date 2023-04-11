import React, { useCallback } from 'react';
import { ISubProps } from '../../types';
import { useVirtualList } from '../../../src';
import { IDataItem, data } from '../../data';

type TItem = { id: number; height: number };

export const HorizontalList: React.FC<ISubProps<TItem>> = ({
	listHeight,
	listWidth,
	//refOuterWrapper,
	//refInnerWrapper,
	//containerStyles,
	//visibleItems,
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
		itemSize: 300,
		listSize: listWidth,
		listDirection: 1,
		overscan: 1,
		useWindowScroll: false,
		items: data,
	});

	const refNode = useCallback((node: HTMLDivElement) => {
		console.log('refNode', node);
	}, []);

	console.log('rerender', visibleItems, msDataRef);

	return (
		<div ref={refNode}>
			<div
				ref={refOuterWrapper}
				style={{
					position: 'fixed',
					top: 60,
					height: listHeight,
					width: listWidth,
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
						height: '100%',
						minWidth: '100%',
						width: Math.max(containerStyles.inner.totalSize, 601),
					}}
				>
					{visibleItems.map((item) => (
						<div
							key={item.item.id}
							style={{
								position: 'absolute',
								top: 0, //item.offset,
								left: item.offset,
								width: item.size,
							}}
						>
							{item.item.id}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
