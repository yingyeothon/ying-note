import { APIGatewayProxyHandler } from "aws-lambda";
import { postModification } from "../actor/actor";

export const handle: APIGatewayProxyHandler = async event => {
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
    return { statusCode: 200, body: "OK" };
  } catch (error) {
    console.error(`Cannot add a new comment`, error);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};