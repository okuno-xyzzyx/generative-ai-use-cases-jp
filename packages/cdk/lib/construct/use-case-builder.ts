import {
  RestApi,
  LambdaIntegration,
  CognitoUserPoolsAuthorizer,
  AuthorizationType,
} from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

export interface UseCaseBuilderProps {
  userPool: UserPool;
  api: RestApi;
  useCaseBuilderTable: Table;
  useCaseIdIndexName: string;
}
export class UseCaseBuilder extends Construct {
  constructor(scope: Construct, id: string, props: UseCaseBuilderProps) {
    super(scope, id);

    const { userPool, api, useCaseBuilderTable, useCaseIdIndexName } = props;

    const commonProperty: NodejsFunctionProps = {
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.minutes(15),
      environment: {
        USECASE_TABLE_NAME: useCaseBuilderTable.tableName,
      },
    };

    // UseCaseBuilder 関連の API を追加する
    const listUseCasesFunction = new NodejsFunction(this, 'ListUseCases', {
      ...commonProperty,
      entry: './lambda/listUseCases.ts',
    });
    useCaseBuilderTable.grantReadData(listUseCasesFunction);

    const listFavoriteUseCasesFunction = new NodejsFunction(
      this,
      'ListFavoriteUseCases',
      {
        ...commonProperty,
        entry: './lambda/listFavoriteUseCases.ts',
        environment: {
          ...commonProperty.environment,
          USECASE_ID_INDEX_NAME: useCaseIdIndexName,
        },
      }
    );
    useCaseBuilderTable.grantReadData(listFavoriteUseCasesFunction);

    const getUseCaseFunction = new NodejsFunction(this, 'GetUseCase', {
      ...commonProperty,
      entry: './lambda/getUseCase.ts',
      environment: {
        ...commonProperty.environment,
        USECASE_ID_INDEX_NAME: useCaseIdIndexName,
      },
    });
    useCaseBuilderTable.grantReadData(getUseCaseFunction);

    const createUseCaseFunction = new NodejsFunction(this, 'CreateUseCase', {
      ...commonProperty,
      entry: './lambda/createUseCase.ts',
    });
    useCaseBuilderTable.grantWriteData(createUseCaseFunction);

    const updateUseCaseFunction = new NodejsFunction(this, 'UpdateUseCase', {
      ...commonProperty,
      entry: './lambda/updateUseCase.ts',
    });
    useCaseBuilderTable.grantReadWriteData(updateUseCaseFunction);

    const deleteUseCaseFunction = new NodejsFunction(this, 'DeleteUseCase', {
      ...commonProperty,
      entry: './lambda/deleteUseCase.ts',
    });
    useCaseBuilderTable.grantReadWriteData(deleteUseCaseFunction);

    const toggleFavoriteFunction = new NodejsFunction(this, 'ToggleFavorite', {
      ...commonProperty,
      entry: './lambda/toggleFavorite.ts',
    });
    useCaseBuilderTable.grantReadWriteData(toggleFavoriteFunction);

    const toggleSharedFunction = new NodejsFunction(this, 'ToggleShared', {
      ...commonProperty,
      entry: './lambda/toggleShared.ts',
    });
    useCaseBuilderTable.grantReadWriteData(toggleSharedFunction);

    const listRecentlyUsedUseCasesFunction = new NodejsFunction(
      this,
      'ListRecentlyUsedUseCases',
      {
        ...commonProperty,
        entry: './lambda/listRecentlyUsedUseCases.ts',
        environment: {
          ...commonProperty.environment,
          USECASE_ID_INDEX_NAME: useCaseIdIndexName,
        },
      }
    );
    useCaseBuilderTable.grantReadData(listRecentlyUsedUseCasesFunction);

    const updateRecentlyUsedUseCaseFunction = new NodejsFunction(
      this,
      'UpdateRecentlyUsedUseCase',
      {
        ...commonProperty,
        entry: './lambda/updateRecentlyUsedUseCase.ts',
      }
    );
    useCaseBuilderTable.grantReadWriteData(updateRecentlyUsedUseCaseFunction);

    // API Gateway
    const authorizer = new CognitoUserPoolsAuthorizer(this, 'Authorizer', {
      cognitoUserPools: [userPool],
    });

    const commonAuthorizerProps = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer,
    };
    const useCasesResource = api.root.addResource('usecases');

    // GET: /usecases
    useCasesResource.addMethod(
      'GET',
      new LambdaIntegration(listUseCasesFunction),
      commonAuthorizerProps
    );

    // POST: /usecases
    useCasesResource.addMethod(
      'POST',
      new LambdaIntegration(createUseCaseFunction),
      commonAuthorizerProps
    );

    const favoriteUseCaseResource = useCasesResource.addResource('favorite');

    // GET: /usecases/favorite
    favoriteUseCaseResource.addMethod(
      'GET',
      new LambdaIntegration(listFavoriteUseCasesFunction),
      commonAuthorizerProps
    );

    const useCaseResource = useCasesResource.addResource('{useCaseId}');

    // GET: /usecases/{useCaseId}
    useCaseResource.addMethod(
      'GET',
      new LambdaIntegration(getUseCaseFunction),
      commonAuthorizerProps
    );

    // PUT: /usecases/{useCaseId}
    useCaseResource.addMethod(
      'PUT',
      new LambdaIntegration(updateUseCaseFunction),
      commonAuthorizerProps
    );

    // DELETE: /usecases/{useCaseId}
    useCaseResource.addMethod(
      'DELETE',
      new LambdaIntegration(deleteUseCaseFunction),
      commonAuthorizerProps
    );

    const favoriteResource = useCaseResource.addResource('favorite');

    // PUT: /usecases/{useCaseId}/favorite
    favoriteResource.addMethod(
      'PUT',
      new LambdaIntegration(toggleFavoriteFunction),
      commonAuthorizerProps
    );

    const sharedResource = useCaseResource.addResource('shared');

    // PUT: /usecases/{useCaseId}/shared
    sharedResource.addMethod(
      'PUT',
      new LambdaIntegration(toggleSharedFunction),
      commonAuthorizerProps
    );

    const recentUseCasesResource = useCasesResource.addResource('recent');

    // GET: /usecases/recent
    recentUseCasesResource.addMethod(
      'GET',
      new LambdaIntegration(listRecentlyUsedUseCasesFunction),
      commonAuthorizerProps
    );

    const recentUseCaseResource =
      recentUseCasesResource.addResource('{useCaseId}');

    // PUT: /usecases/recent/{useCaseId}
    recentUseCaseResource.addMethod(
      'PUT',
      new LambdaIntegration(updateRecentlyUsedUseCaseFunction),
      commonAuthorizerProps
    );
  }
}
