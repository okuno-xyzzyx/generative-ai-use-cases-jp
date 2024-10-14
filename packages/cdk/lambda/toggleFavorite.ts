import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ToggleFavoriteRequest } from 'generative-ai-use-cases-jp';
import { toggleFavorite } from './repository';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId: string =
      event.requestContext.authorizer!.claims['cognito:username'];
    const useCaseId = event.pathParameters!.useCaseId!;
    const req: ToggleFavoriteRequest = JSON.parse(event.body!);
    const ownerUserId = req.ownerUserId;

    await toggleFavorite(userId, useCaseId, ownerUserId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: '',
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};