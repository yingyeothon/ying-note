import { serverUrlPrefix } from "./server";

export const addComment = (noteId: string, content: string) =>
  fetch(serverUrlPrefix + `/api/${noteId}/comment`, {
    method: "PUT",
    body: content
  })
    .then(r => r.text())
    .then(r => r === "OK");
