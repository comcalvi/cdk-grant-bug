import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkGrantBug extends ecs.FargateService {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      cluster: ecs.Cluster.fromClusterAttributes(scope, 'Cluster', {
        clusterName: 'Cluster',
        vpc: ec2.Vpc.fromVpcAttributes(scope, 'Vpc', {
          availabilityZones: ['us-east-1'],
          publicSubnetIds: ['sub-1'],
          vpcId: cdk.Fn.importValue('Vpc'),
        }),
      }),
      taskDefinition: new ecs.FargateTaskDefinition(scope, 'TaskDefinition'),
    });

    this.taskDefinition.addContainer('Container', { image: ecs.ContainerImage.fromRegistry('nginx') });

    const queue = new sqs.Queue(this, 'Queue');

    queue.grantConsumeMessages(this.taskDefinition.taskRole);
  }
}
