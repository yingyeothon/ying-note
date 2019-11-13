import { APIGatewayProxyHandler } from "aws-lambda";
import { postModification } from "../actor/actor";
import { withCors } from "../cors";

export const handle: APIGatewayProxyHandler = withCors(async event => {
  const { noteId } = event.pathParameters;
  if (!noteId) {
    return { statusCode: 404, body: "Not Found" };
  }

  try {
    await postModification(noteId, {
      type: "addComment",
      noteId,
      content: event.body
    });
    return { statusCode: 200, body: "OK" };
  } catch (error) {
    console.error(`Cannot add a new comment`, error);
    return { statusCode: 500, body: "Internal Server Error" };
  }
});
