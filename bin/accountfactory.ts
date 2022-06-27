#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AccountfactoryStack } from '../lib/accountfactory-stack';

const app = new cdk.App();
new AccountfactoryStack(app, 'AccountfactoryStack', {
  env: { account: 'x', region: 'ap-southeast-2' },
});