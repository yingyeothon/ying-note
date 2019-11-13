import { serverUrlPrefix } from "./server";

export const deleteNote = (noteId: string) =>
  fetch(serverUrlPrefix + `/api/${noteId}`, {
    method: "DELETE"
  })
    .then(r => r.text())
    .then(r => r === "OK");
