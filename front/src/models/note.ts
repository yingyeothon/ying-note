import { IComment } from "./comment";

export interface INote {
  noteId: string;
  content: string;
  writeDate: string;
  comments: IComment[];
}
