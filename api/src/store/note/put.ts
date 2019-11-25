import { APIGatewayProxyHandler } from "aws-lambda";
import { postModification } from "../actor/actor";
import { withCors } from "../cors";
import { INote } from "../model";
import { getRepository } from "../repository";

export const handle: APIGatewayProxyHandler = withCors(async event => {
  const { noteId } = event.pathParameters;
  if (!noteId) {
    return { statusCode: 404, body: "Not Found" };
  }

  try {
    await postModification(noteId, {
      type: "upsertNote",
      noteId,
      content: event.body
    });

    const note = await getRepository().get<INote>(noteId);
    return { statusCode: 200, body: JSON.stringify(note) };
  } catch (error) {
    console.error(`Cannot add a note`, error);
    return { statusCode: 500, body: "Internal Server Error" };
  }
});
