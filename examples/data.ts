export type IDataItem = { id: number; height: number };

let item: IDataItem = { id: 0, height: 0 };
const data: IDataItem[] = [];

for (let i = 0; i < 10; i++) {
	item = { id: i, height: 100 };
	data.push(item);
}

export { data };
