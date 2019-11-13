import { serverUrlPrefix } from "./server";

export const putNote = (noteId: string, content: string) =>
  fetch(serverUrlPrefix + `/api/${noteId}`, {
    method: "PUT",
    body: content
  })
    .then(r => r.text())
    .then(r => r === "OK");
