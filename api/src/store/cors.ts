import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from "aws-lambda";

const corsHeader = () => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true
});

type Handler = (
  event: APIGatewayProxyEvent,
  context: Context
) => Promise<APIGatewayProxyResult>;

export const withCors = (handler: Handler): Handler => async (
  event,
  context
) => {
  try {
    const result = await handler(event, context);
    return {
      ...result,
      headers: {
        ...(result.headers || {}),
        ...corsHeader()
      }
    };
  } catch (error) {
    console.error(`Uncaught error`, error);
    return {
      statusCode: 500,
      body: "Internal Server Error",
      headers: corsHeader()
    };
  }
};
