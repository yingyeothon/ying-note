export interface INote {
  noteId: string;
  content: string;
  writeDate: string;
  comments: IComment[];
}

export interface IComment {
  commentId: string;
  content: string;
  writeDate: string;
}
