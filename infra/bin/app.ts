#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ElearningLabStack } from '../lib/elearning-lab-stack';

const app = new cdk.App();

new ElearningLabStack(app, 'ElearningLab', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'ap-southeast-1',
  },
  description: 'E-learning lab: EC2 + Compose (app + MySQL) + ECR + GitHub OIDC',
});
