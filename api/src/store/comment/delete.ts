import { APIGatewayProxyHandler } from "aws-lambda";
import { postModification } from "../actor/actor";
import { withCors } from "../cors";
import { INote } from "../model";
import { getRepository } from "../repository";

export const handle: APIGatewayProxyHandler = withCors(async event => {
  const { noteId, commentId } = event.pathParameters;
  if (!noteId) {
    return { statusCode: 404, body: "Not Found" };
  }

  try {
    await postModification(noteId, {
      type: "deleteComment",
      noteId,
      commentId
    });

    const note = await getRepository().get<INote>(noteId);
    return { statusCode: 200, body: JSON.stringify(note) };
  } catch (error) {
    console.error(`Cannot add a new comment`, error);
    return {
      statusCode: 500,
      body: "Internal Server Error"
    };
  }
});
