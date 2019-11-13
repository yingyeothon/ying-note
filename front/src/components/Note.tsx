import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { INote } from "../models";
import { getNote } from "../fetch";
import Comment from "./Comment";

const Note: React.FC = () => {
  const { noteId } = useParams();
  const [note, setNote] = useState<INote | null>(null);
  useEffect(() => {
    if (note === null && noteId) {
      getNote(noteId)
        .then(value => setNote(value))
        .catch(console.warn);
    }
  }, [note, noteId]);
  return note === null ? (
    <div>
      <p>{noteId}</p>
      <p>Not found</p>
    </div>
  ) : (
    <div>
      <p>{note.content}</p>
      <sub>{note.writeDate}</sub>
      <ul>
        {note.comments.map(comment => (
          <li key={comment.commentId}>
            <Comment {...comment} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Note;
