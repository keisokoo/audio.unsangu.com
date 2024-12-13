import Storage from "./index";

export type ISOString = string;
export interface AudioItemType {
  id: string;
  name: string;
  audioFile: File | null;
  aToB: {
    id: string;
    title: string;
    a: number;
    b: number;
    createdAt: ISOString;
  }[];
}
export const audioInitialItem: Readonly<AudioItemType> = {
  id: "",
  name: "",
  audioFile: null,
  aToB: [],
};
export const audioDbConfigs = {
  dbName: "test",
  storeName: "test",
  version: 1,
};
export const audioStorage = new Storage<AudioItemType>(
  audioDbConfigs.dbName,
  audioDbConfigs.storeName,
  audioDbConfigs.version
);
