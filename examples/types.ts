import { IDataItem } from './data';

export interface ISubProps<T> {
	listHeight: number;
	listWidth: number;
	data: IDataItem[];
}
