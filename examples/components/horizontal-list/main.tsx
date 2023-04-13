import React from 'react';
import { ISubProps } from '../../types';
import { useVirtualList } from '../../../src';
import { IDataItem } from '../../data';

/**
 *
 * Bugs:
 * listsize % itemsize > 0 visible range
 *
 * Todos:
 * use containerstyles in other hooks
 */

export const HorizontalList: React.FC<ISubProps<IDataItem>> = ({
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
		listSize: listWidth,
		listDirection: 1,
		overscan: 1,
		useWindowScroll: false,
		items: data,
	});

	return (
		<div>
			<div
				ref={refOuterWrapper}
				style={{
					position: 'fixed',
					top: 380,
					left: 60,
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
						width: Math.max(containerStyles.innerContainerStyle.totalSize, 601),
					}}
				>
					{visibleItems.map((item) => (
						<div
							key={item.item.id}
							style={{
								position: 'absolute',
								top: 0,
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
