import * as cdk from 'aws-cdk-lib';
import * as assertions from 'aws-cdk-lib/assertions';
import { CdkGrantBug } from '../lib';

test('No circular dependency', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app);

  new CdkGrantBug(stack, 'Bug');

  expect(() => assertions.Template.fromStack(stack)).not.toThrow();
});
