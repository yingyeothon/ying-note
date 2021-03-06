import { APIGatewayProxyHandler } from "aws-lambda";
import { withCors } from "../cors";
import { INote } from "../model";
import { getRepository } from "../repository";

export const handle: APIGatewayProxyHandler = withCors(async event => {
  const { noteId } = event.pathParameters;
  if (!noteId) {
    return { statusCode: 404, body: "Not Found" };
  }

  const note = await getRepository().get<INote>(noteId);
  if (!note) {
    return { statusCode: 404, body: "Not Found" };
  }
  return { statusCode: 200, body: JSON.stringify(note) };
});
