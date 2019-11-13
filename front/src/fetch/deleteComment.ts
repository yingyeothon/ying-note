import { serverUrlPrefix } from "./server";

export const deleteComment = (noteId: string, commentId: string) =>
  fetch(serverUrlPrefix + `/api/${noteId}/comment/${commentId}`, {
    method: "DELETE"
  })
    .then(r => r.text())
    .then(r => r === "OK");
