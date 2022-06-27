import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AccountFactoryAccount, INewAccountProps } from './constructs/awsaccount'

export class AccountfactoryStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const AccountTahi = new AccountFactoryAccount(this, 'accountTahi', {
      sSOUserEmail: 'tahi@test.com',
      sSOUserFirstName: 'tahi',
      sSOUserLastName: 'test',
      managedOrganizationalUnit: 'ou-qme3-zmhb40gw', // accountfactorytest
      accountName: 'tahi',
      accountEmail: 'tahi@test.com'
    });
  }
}

