import React from "react";
import { IComment } from "../models";

const Comment: React.FC<IComment> = comment => {
  return (
    <div>
      <p>{comment.content}</p>
      <sub>{comment.writeDate}</sub>
    </div>
  );
};

export default Comment;
