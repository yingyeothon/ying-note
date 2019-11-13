import { APIGatewayProxyHandler } from "aws-lambda";
import { withCors } from "../cors";
import { getRepository } from "../repository";

export const handle: APIGatewayProxyHandler = withCors(async event => {
  const { noteId } = event.pathParameters;
  if (!noteId) {
    return { statusCode: 404, body: "Not Found" };
  }

  try {
    await getRepository().delete(noteId);
    return { statusCode: 200, body: "OK" };
  } catch (error) {
    console.error(`Cannot add a new comment`, error);
    return { statusCode: 500, body: "Internal Server Error" };
  }
});
