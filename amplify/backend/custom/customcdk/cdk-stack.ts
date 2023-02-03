import * as cdk from "@aws-cdk/core";
import * as AmplifyHelpers from "@aws-amplify/cli-extensibility-helper";
import { Function } from "@aws-cdk/aws-lambda";
import { Bucket, BucketAccessControl, HttpMethods } from "@aws-cdk/aws-s3";
import { Distribution, OriginAccessIdentity } from "@aws-cdk/aws-cloudfront";
import { S3Origin } from "@aws-cdk/aws-cloudfront-origins";
import { HttpApi } from "@aws-cdk/aws-apigatewayv2";

import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";

import { AmplifyDependentResourcesAttributes } from "../../types/amplify-dependent-resources-ref";

export class cdkStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props?: cdk.StackProps,
    amplifyResourceProps?: AmplifyHelpers.AmplifyResourceProps
  ) {
    super(scope, id, props);
    new cdk.CfnParameter(this, "env", {
      type: "String",
      description: "Current Amplify CLI env name"
    });

    // Add cors
    const bucket = new Bucket(this, "Bucket", {
      accessControl: BucketAccessControl.PRIVATE,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
    bucket.addCorsRule({
      allowedMethods: [HttpMethods.GET, HttpMethods.HEAD],
      allowedHeaders: ["*"],
      allowedOrigins: ["*"],
      maxAge: 3000
    });

    const originAccessIdentity = new OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );
    bucket.grantRead(originAccessIdentity);

    const distribution = new Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: new S3Origin(bucket, { originAccessIdentity })
      }
    });
    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: distribution.domainName
    });

    const retVal: AmplifyDependentResourcesAttributes =
      AmplifyHelpers.addResourceDependency(
        this,
        amplifyResourceProps.category,
        amplifyResourceProps.resourceName,
        [{ category: "function", resourceName: "nuxtdeployedapp" }]
      );
    const GetNuxtFunctionArn = cdk.Fn.ref(retVal.function.nuxtdeployedapp.Arn);

    const importedLambdaFromArn = Function.fromFunctionArn(
      this,
      "GetNuxt",
      GetNuxtFunctionArn
    );

    const nuxtIntegration = new HttpLambdaIntegration(
      "NuxtFunction",
      importedLambdaFromArn
    );

    const ApiGWNuxt = new HttpApi(this, "NuxtGateway", {
      apiName: "nuxt-gateway",
      defaultIntegration: nuxtIntegration
    });

    new cdk.CfnOutput(this, "APIEndpoint", {
      value: ApiGWNuxt.apiEndpoint
    });
  }
}
