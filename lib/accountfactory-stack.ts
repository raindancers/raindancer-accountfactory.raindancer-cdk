import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AccountFactoryAccount, INewAccountProps } from './constructs/awsaccount'

export class AccountfactoryStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //https://repost.aws/questions/QUmWAj-bK5QJKtytEIPxlmWw/control-tower-that-the-parent-organizational-unit-is-not-enrolled-in-aws-control-tower-when-it-is

    const AccountTahi = new AccountFactoryAccount(this, 'accountTahi', {
      SSOUserEmail: 'aws.tahitest@education.govt.nz',
      SSOUserFirstName: 'tahi',
      SSOUserLastName: 'test',
      ManagedOrganizationalUnit: 'accountfactorytest (ou-qme3-zmhb40gw)', // "Custom (ou-xfe5-a8hb8ml8)"
      AccountName: 'tahi',
      AccountEmail: 'aws.tahitest@education.govt.nz'
    });
  }
}

