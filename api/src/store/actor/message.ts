export interface IUpsertNote {
  type: "upsertNote";
  noteId: string;
  content: string;
}

export interface IAddComment {
  type: "addComment";
  noteId: string;
  content: string;
}

export interface IDeleteComment {
  type: "deleteComment";
  noteId: string;
  commentId: string;
}

export type Modification = IUpsertNote | IAddComment | IDeleteComment;
