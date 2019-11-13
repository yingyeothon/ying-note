import { APIGatewayProxyHandler } from "aws-lambda";
import { postModification } from "../actor/actor";

export const handle: APIGatewayProxyHandler = async event => {
  const { noteId } = event.pathParameters;
  if (!noteId) {
    return { statusCode: 404, body: "Not Found" };
  }

  try {
    await postModification(noteId, {
      type: "new",
      noteId,
      content: event.body
    });
    return { statusCode: 200, body: "OK" };
  } catch (error) {
    console.error(`Cannot add a note`, error);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
