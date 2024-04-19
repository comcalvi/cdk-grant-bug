import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';

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

export class CdkGrantBugGoodScopes extends ecs.FargateService {
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

    const queue = new sqs.Queue(scope, 'Queue');

    queue.grantConsumeMessages(this.taskDefinition.taskRole);
  }
}

export class CdkGrantBugComponent extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    const fargateService = new ecs.FargateService(this, id, {
      cluster: ecs.Cluster.fromClusterAttributes(this, 'Cluster', {
        clusterName: 'Cluster',
        vpc: ec2.Vpc.fromVpcAttributes(this, 'Vpc', {
          availabilityZones: ['us-east-1'],
          publicSubnetIds: ['sub-1'],
          vpcId: cdk.Fn.importValue('Vpc'),
        }),
      }),
      taskDefinition: new ecs.FargateTaskDefinition(this, 'TaskDefinition'),
    });

    fargateService.taskDefinition.addContainer('Container', { image: ecs.ContainerImage.fromRegistry('nginx') });

    const queue = new sqs.Queue(this, 'Queue');

    queue.grantConsumeMessages(fargateService.taskDefinition.taskRole);
  }
}

export class QueueConstruct extends Construct {
  public queue1: sqs.IQueue;
  public queue2: sqs.IQueue;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.queue1 = new sqs.Queue(this, 'Queue1');
    this.queue2 = new sqs.Queue(this, 'Queue2');
  }
}

export class RoleConstruct extends Construct {
  public role: iam.IRole;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.role = new iam.Role(this, 'role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });
  }
}

export class L3Construct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    const A = new Construct(scope, 'A');
    const B = new Construct(scope, 'B');

    const C = new QueueConstruct(A, 'C');
    const D = new QueueConstruct(A, 'D');

    const E = new RoleConstruct(B, 'E');
    const F = new RoleConstruct(B, 'F');

    //C.node.addDependency(E);
    C.queue1.grantConsumeMessages(E.role);
    //C.queue1.node.addDependency(D.queue1);
  }
}

export class CdkGrantBugStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    //new CdkGrantBugGoodScopes(this, 'CdkGrantBug');
    new CdkGrantBug(this, 'CdkGrantBug');
    //new CdkGrantBugComponent(this, 'CdkGrantBug');

    //new L3Construct(this, 'L3');
  }
}
