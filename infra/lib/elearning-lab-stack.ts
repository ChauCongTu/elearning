import * as fs from 'node:fs';
import * as path from 'node:path';
import * as cdk from 'aws-cdk-lib';
import * as budgets from 'aws-cdk-lib/aws-budgets';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export class ElearningLabStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const githubRepo =
      (this.node.tryGetContext('githubRepo') as string | undefined) ??
      'ChauCongTu/elearning';
    const allowedCidr =
      (this.node.tryGetContext('allowedCidr') as string | undefined) ??
      '0.0.0.0/0';
    const existingOidcArn = this.node.tryGetContext(
      'githubOidcProviderArn',
    ) as string | undefined;
    const budgetEmail = this.node.tryGetContext('budgetEmail') as
      | string
      | undefined;

    const repoRoot = path.join(__dirname, '..', '..');

    const repository = new ecr.Repository(this, 'AppRepo', {
      repositoryName: 'elearning',
      imageScanOnPush: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      emptyOnDelete: false,
      lifecycleRules: [
        {
          maxImageCount: 10,
          description: 'Keep last 10 images',
        },
      ],
    });

    const mediaBucket = new s3.Bucket(this, 'MediaBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    const vpc = ec2.Vpc.fromLookup(this, 'DefaultVpc', { isDefault: true });

    const securityGroup = new ec2.SecurityGroup(this, 'AppSg', {
      vpc,
      description: 'elearning lab — HTTP in, no MySQL to the internet',
      allowAllOutbound: true,
    });
    securityGroup.addIngressRule(
      ec2.Peer.ipv4(allowedCidr),
      ec2.Port.tcp(80),
      'HTTP from allowed CIDR',
    );

    const instanceRole = new iam.Role(this, 'Ec2AppRole', {
      roleName: 'elearning-ec2-app',
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      description: 'EC2 instance profile: ECR pull, SSM params, Session Manager, S3 media',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'AmazonSSMManagedInstanceCore',
        ),
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'AmazonEC2ContainerRegistryReadOnly',
        ),
      ],
    });

    instanceRole.addToPolicy(
      new iam.PolicyStatement({
        sid: 'LabSsmParams',
        actions: [
          'ssm:GetParameter',
          'ssm:GetParameters',
          'ssm:GetParametersByPath',
          'ssm:PutParameter',
        ],
        resources: [
          `arn:aws:ssm:${this.region}:${this.account}:parameter/elearning/lab`,
          `arn:aws:ssm:${this.region}:${this.account}:parameter/elearning/lab/*`,
        ],
      }),
    );

    mediaBucket.grantReadWrite(instanceRole);
    instanceRole.addToPolicy(
      new iam.PolicyStatement({
        sid: 'SsmKmsDecrypt',
        actions: ['kms:Decrypt'],
        resources: ['*'],
        conditions: {
          StringEquals: {
            'kms:ViaService': `ssm.${this.region}.amazonaws.com`,
          },
        },
      }),
    );

    const instance = new ec2.Instance(this, 'AppHost', {
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.SMALL,
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux2023({
        cpuType: ec2.AmazonLinuxCpuType.ARM_64,
      }),
      role: instanceRole,
      securityGroup,
      associatePublicIpAddress: true,
      requireImdsv2: true,
      blockDevices: [
        {
          deviceName: '/dev/xvda',
          volume: ec2.BlockDeviceVolume.ebs(30, {
            volumeType: ec2.EbsDeviceVolumeType.GP3,
            encrypted: true,
          }),
        },
      ],
    });
    cdk.Tags.of(instance).add('App', 'elearning');
    cdk.Tags.of(instance).add('Env', 'lab');

    this.putSsmString('/elearning/lab/ECR_URI', repository.repositoryUri);
    this.putSsmString('/elearning/lab/EC2_INSTANCE_ID', instance.instanceId);
    this.putSsmString('/elearning/lab/AWS_BUCKET', mediaBucket.bucketName);
    this.putSsmString('/elearning/lab/AWS_DEFAULT_REGION', this.region);
    this.putSsmString('/elearning/lab/APP_ENV', 'production');
    this.putSsmString('/elearning/lab/APP_DEBUG', 'false');
    this.putSsmString('/elearning/lab/DB_HOST', 'mysql');
    this.putSsmString('/elearning/lab/DB_PORT', '3306');
    this.putSsmString('/elearning/lab/DB_DATABASE', 'elearning');
    this.putSsmString('/elearning/lab/DB_USERNAME', 'app');
    this.putSsmString('/elearning/lab/DB_CONNECTION', 'mysql');
    this.putSsmString('/elearning/lab/LOG_CHANNEL', 'stderr');

    const userData = instance.userData;
    userData.addCommands(
      'install -d -m 0755 /opt/elearning',
      this.writeB64File(
        '/opt/elearning/docker-compose.yml',
        fs.readFileSync(path.join(repoRoot, 'docker-compose.yml')),
      ),
      this.writeB64File(
        '/opt/elearning/docker-compose.ec2.yml',
        fs.readFileSync(path.join(repoRoot, 'docker-compose.ec2.yml')),
      ),
      this.writeB64File(
        '/opt/elearning/fetch-env.sh',
        fs.readFileSync(path.join(repoRoot, 'docker/ec2/fetch-env.sh')),
      ),
      this.writeB64File(
        '/opt/elearning/deploy.sh',
        fs.readFileSync(path.join(repoRoot, 'docker/ec2/deploy.sh')),
      ),
      this.writeB64File(
        '/opt/elearning/bootstrap.sh',
        fs.readFileSync(path.join(repoRoot, 'docker/ec2/bootstrap.sh')),
      ),
      'chmod +x /opt/elearning/*.sh',
      'bash /opt/elearning/bootstrap.sh',
    );

    const oidcProvider = existingOidcArn
      ? iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
          this,
          'GitHubOidc',
          existingOidcArn,
        )
      : new iam.OpenIdConnectProvider(this, 'GitHubOidc', {
          url: 'https://token.actions.githubusercontent.com',
          clientIds: ['sts.amazonaws.com'],
        });

    const githubDeployRole = new iam.Role(this, 'GitHubDeployRole', {
      roleName: 'elearning-github-deploy',
      description: 'GitHub Actions OIDC — push ECR and SSM deploy to lab EC2',
      assumedBy: new iam.OpenIdConnectPrincipal(oidcProvider, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
        },
        StringLike: {
          'token.actions.githubusercontent.com:sub': `repo:${githubRepo}:*`,
        },
      }),
      maxSessionDuration: cdk.Duration.hours(1),
    });

    repository.grantPullPush(githubDeployRole);
    githubDeployRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ecr:GetAuthorizationToken'],
        resources: ['*'],
      }),
    );
    githubDeployRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ssm:SendCommand'],
        resources: [
          `arn:aws:ec2:${this.region}:${this.account}:instance/${instance.instanceId}`,
          `arn:aws:ssm:${this.region}::document/AWS-RunShellScript`,
        ],
      }),
    );
    githubDeployRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          'ssm:GetCommandInvocation',
          'ssm:ListCommandInvocations',
          'ssm:ListCommands',
        ],
        resources: ['*'],
      }),
    );
    githubDeployRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ec2:DescribeInstances'],
        resources: ['*'],
      }),
    );
    githubDeployRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameter', 'ssm:GetParameters'],
        resources: [
          `arn:aws:ssm:${this.region}:${this.account}:parameter/elearning/lab/ECR_URI`,
          `arn:aws:ssm:${this.region}:${this.account}:parameter/elearning/lab/EC2_INSTANCE_ID`,
        ],
      }),
    );

    this.putSsmString(
      '/elearning/lab/GITHUB_DEPLOY_ROLE_ARN',
      githubDeployRole.roleArn,
    );

    const budget: budgets.CfnBudget = new budgets.CfnBudget(this, 'LabBudget', {
      budget: {
        budgetName: 'elearning-lab',
        budgetType: 'COST',
        timeUnit: 'MONTHLY',
        budgetLimit: { amount: 20, unit: 'USD' },
      },
    });
    if (budgetEmail) {
      budget.notificationsWithSubscribers = [
        {
          notification: {
            comparisonOperator: 'GREATER_THAN',
            notificationType: 'ACTUAL',
            threshold: 80,
            thresholdType: 'PERCENTAGE',
          },
          subscribers: [{ address: budgetEmail, subscriptionType: 'EMAIL' }],
        },
      ];
    }

    new cdk.CfnOutput(this, 'GitHubDeployRoleArn', {
      value: githubDeployRole.roleArn,
      description: 'Paste into GitHub Actions secret AWS_ROLE_ARN',
    });
    new cdk.CfnOutput(this, 'EcrUri', {
      value: repository.repositoryUri,
    });
    new cdk.CfnOutput(this, 'PublicIp', {
      value: instance.instancePublicIp,
      description: 'Changes after stop/start unless you attach an Elastic IP',
    });
    new cdk.CfnOutput(this, 'MediaBucketName', {
      value: mediaBucket.bucketName,
    });
    new cdk.CfnOutput(this, 'GitHubRepoTrust', {
      value: `repo:${githubRepo}:*`,
    });
    new cdk.CfnOutput(this, 'SsmPrefix', {
      value: '/elearning/lab',
    });
  }

  private putSsmString(name: string, value: string): ssm.StringParameter {
    const id = name.replace(/[^A-Za-z0-9]/g, '');
    return new ssm.StringParameter(this, `Param${id}`, {
      parameterName: name,
      stringValue: value,
      tier: ssm.ParameterTier.STANDARD,
    });
  }

  private writeB64File(dest: string, contents: Buffer): string {
    const b64 = contents.toString('base64');
    return `echo '${b64}' | base64 -d > ${dest}`;
  }
}
