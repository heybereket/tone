export interface Message {
    id: string;
	content: string;
	author: string;
}

export type PickWhereValuesAre<T, V> = {
	[Key in keyof T as T[Key] extends V ? Key : never]: T[Key];
};