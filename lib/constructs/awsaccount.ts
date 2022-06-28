import * as cdk from 'aws-cdk-lib'
import * as constructs from 'constructs'
import * as path from 'path'

import {
  custom_resources as cr,
  aws_lambda as lambda,
  aws_iam as iam,
  aws_servicecatalog as sc
}
from 'aws-cdk-lib'

export interface INewAccountProps {
  SSOUserEmail: string;
  SSOUserFirstName: string;
  SSOUserLastName: string;
  ManagedOrganizationalUnit: string;
  AccountName: string;
  AccountEmail: string;
}

export class AccountFactoryAccount extends constructs.Construct {
  public readonly accountId: string;

  constructor(scope: constructs.Construct, id: string, props: INewAccountProps) {
    super(scope, id);

    const callAccountFactory = new lambda.SingletonFunction(this, 'CallAccountFactoryLambda', {
      uuid: 'f7d4f730-4ee1-11e8-9c2d-fa7ae01bbebc',
      code: lambda.Code.fromAsset(path.join('lib/lambda/oompaloompa'),
          {
            bundling: { 
              image: lambda.Runtime.PYTHON_3_9.bundlingImage,
              command: [
                'bash', '-c',
                'pip install -r requirements.txt -t /asset-output && cp -au . /asset-output'
              ],
            },
          }),
      handler: 'oompaloompa.on_event',
      timeout: cdk.Duration.seconds(300),
      runtime: lambda.Runtime.PYTHON_3_9
    });

    callAccountFactory.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "servicecatalog:SearchProductsAsAdmin",
          "servicecatalog:DescribeProductAsAdmin",
          "servicecatalog:ListProvisioningArtifacts"
        ],
        resources: ['*']
      })
    );

    const callAccountFactoryCRProvider = new cr.Provider(this, 'CallAccountFactoryCR', {
      onEventHandler: callAccountFactory,
    });

    const now = new Date();

    const serviceCatalogId = new cdk.CustomResource(this, 'provisioningArtifactId', {
      properties: {'RERUN': now.toISOString()},
      serviceToken: callAccountFactoryCRProvider.serviceToken,
    });


    let newAccountParameters = [];
    for (let [k, v] of Object.entries(props)){
      let provisioningParameterProperty: sc.CfnCloudFormationProvisionedProduct.ProvisioningParameterProperty = {
        key: k,
        value: v,
      };
      newAccountParameters.push(provisioningParameterProperty);
    };
    
    const newAccount = new sc.CfnCloudFormationProvisionedProduct(this, 'newaccount', {
      //productId: serviceCatalogId.getAtt('ProductId').toString(),  // swap to productId
      productName: 'AWS Control Tower Account Factory',
      provisionedProductName: props.AccountName,             
      provisioningArtifactId: serviceCatalogId.getAtt('ArtifactId').toString(),
      provisioningParameters: newAccountParameters
    })   
  }
}