export interface Message {
   sender: string;
   text: string;
}

export type PickWhereValuesAre<T, V> = {
	[Key in keyof T as T[Key] extends V ? Key : never]: T[Key];
};