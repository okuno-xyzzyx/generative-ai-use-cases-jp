import { Construct } from 'constructs';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';

export class Database extends Construct {
  public readonly table: ddb.Table;
  public readonly feedbackIndexName: string;
  public readonly useCaseBuilderTable: ddb.Table;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const feedbackIndexName = 'FeedbackIndex';
    const table = new ddb.Table(this, 'Table', {
      partitionKey: {
        name: 'id',
        type: ddb.AttributeType.STRING,
      },
      sortKey: {
        name: 'createdDate',
        type: ddb.AttributeType.STRING,
      },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
    });

    table.addGlobalSecondaryIndex({
      indexName: feedbackIndexName,
      partitionKey: {
        name: 'feedback',
        type: ddb.AttributeType.STRING,
      },
    });

    const useCaseBuilderTable = new ddb.Table(this, 'UseCaseBuilderTable', {
      partitionKey: {
        name: 'userId',
        type: ddb.AttributeType.STRING,
      },
      sortKey: {
        name: 'useCaseId',
        type: ddb.AttributeType.STRING,
      },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
    });

    this.table = table;
    this.feedbackIndexName = feedbackIndexName;
    this.useCaseBuilderTable = useCaseBuilderTable;
  }
}
