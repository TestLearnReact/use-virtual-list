import React from 'react';
import { VerticalList } from '../vertical-list';
import { IDataItem, data } from '../../data';
import { LoadMoreEvent } from '../../../src/types';
import { HorizontalList } from '../horizontal-list';
import { VerticalListWindow } from '../vertikal-list-window';

export const LIST_HEIGHT = 300;
export const LIST_WIDTH = 600;

export const ListTypes: React.FC = () => {
	return (
		<>
			<VerticalListWindow
				listHeight={LIST_HEIGHT}
				listWidth={LIST_WIDTH}
				data={data}
			/>
			{/* <VerticalList
				listHeight={LIST_HEIGHT}
				listWidth={LIST_WIDTH}
				data={data}
			/> */}
			{/* <HorizontalList
				listHeight={LIST_HEIGHT}
				listWidth={LIST_WIDTH}
				data={data}
			/> */}
		</>
	);
};
