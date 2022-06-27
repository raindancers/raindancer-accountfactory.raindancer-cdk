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
  sSOUserEmail: string;
  sSOUserFirstName: string;
  sSOUserLastName: string;
  managedOrganizationalUnit: string;
  accountName: string;
  accountEmail: string;
}

export class AccountFactoryAccount extends constructs.Construct {
  public readonly accountId: string;

  constructor(scope: constructs.Construct, id: string, props: INewAccountProps) {
    super(scope, id);

    

    const callAccountFactory = new lambda.Function(this, 'CallAccountFactoryLambda', {
      handler: 'oompaloompa.on_event',
      //code: lambda.Code.fromAsset(path.join(__dirname, 'lambda/oompaloompa'),
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
      runtime: lambda.Runtime.PYTHON_3_9,
      //environment: 
    });

    callAccountFactory.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "servicecatalog:SearchProductsAsAdmin",
          "servicecatalog:DescribeProductAsAdmin"
        ],
        resources: ['*']
      })
    );

    const callAccountFactoryCRProvider = new cr.Provider(this, 'CallAccountFactoryCR', {
      onEventHandler: callAccountFactory,
      //logRetention: logs.RetentionDays.ONE_YEAR,
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
    
    // this is where thigns break.. 

    new cdk.CfnOutput(this,'productid', {value: serviceCatalogId.getAtt('ProductId').toString()});
    new cdk.CfnOutput(this,'artifactid', {value: serviceCatalogId.getAtt('ArtifactId').toString()});
    

    // const newAccount = new sc.CfnCloudFormationProvisionedProduct(this, 'newaccount', {
    //   productId: provisioningArtifactId.getAtt('ProductId').toString(),  // swap to productId
    //   provisionedProductName: props.accountName,             
    //   provisioningArtifactId: provisioningArtifactId.getAtt('ArtifactId').toString(),
    //   provisioningParameters: newAccountParameters
    //})   
  }
}