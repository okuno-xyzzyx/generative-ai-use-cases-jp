import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateUseCaseRequest } from 'generative-ai-use-cases-jp';
import { createUseCase } from './repository';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const req: CreateUseCaseRequest = JSON.parse(event.body!);
    const userId: string =
      event.requestContext.authorizer!.claims['cognito:username'];
    const title = req.title;
    const promptTemplate = req.promptTemplate;
    const useCaseId = await createUseCase(userId, title, promptTemplate);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        useCaseId,
      }),
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