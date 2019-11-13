import { serverUrlPrefix } from "./server";

export const getNote = (noteId: string) =>
  fetch(serverUrlPrefix + `/api/${noteId}`).then(r => r.json());
