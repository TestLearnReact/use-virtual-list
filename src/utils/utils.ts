export function isNumber(val: unknown): val is number {
	return typeof val === 'number' && !Number.isNaN(val);
}

export function getLastArrItem<T>(arr: T[]) {
	return arr[arr.length - 1];
}

export function getFirstArrItem<T>(arr: T[]) {
	return arr[0];
}
export function isSameRange<T>(arr1: T[], arr2: T[]) {
	return arr1[0] === arr2[0] && arr1[arr1.length - 1] === arr2[arr2.length - 1];
}

// todo faster, cleaner,for loop, same as lodash?
export const range = (start: number, end: number) =>
	//	Array.from(Array(Math.abs(end - start) + 1), (_, i) => start + i);
	Array.from(Array(Math.abs(end - start)), (_, i) => start + i);

// This version will handle reverse range as well (large to small) as well:
export const rangeNePo = (start: number, end: number) => {
	const inc = (end - start) / Math.abs(end - start);

	return Array.from(
		Array(Math.abs(end - start) + 1),
		(_, i) => start + i * inc
	);
};
