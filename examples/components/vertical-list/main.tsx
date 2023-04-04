import React from 'react';
import { ISubProps } from '../../types';

const vpHeight = 300;
const vpWidth = 600;

type TItem = { id: number; height: number };

export const VerticalList: React.FC<ISubProps<TItem>> = ({
	height,
	refOuterWrapper,
	refInnerWrapper,
	containerStyles,
	visibleItems,
}) => {
	return (
		<div
			ref={refOuterWrapper}
			style={{
				position: 'fixed',
				top: 60,
				height: vpHeight,
				width: vpWidth,
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
	);
};
