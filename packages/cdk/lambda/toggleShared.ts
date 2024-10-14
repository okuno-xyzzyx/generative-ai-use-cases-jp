import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getUseCase, toggleShared } from './repository';
import { HasShared } from 'generative-ai-use-cases-jp';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId: string =
      event.requestContext.authorizer!.claims['cognito:username'];
    const useCaseId = event.pathParameters!.useCaseId!;

    const useCase = await getUseCase(userId, `usecase#${useCaseId}`);

    if (!useCase) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Use Case not found' }),
      };
    }

    const hasShared = useCase.hasShared;
    const newHasShared: HasShared = await toggleShared(
      userId,
      useCaseId,
      hasShared
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ newHasShared }),
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