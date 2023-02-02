var AWS = require("aws-sdk");
AWS.config.region = process.env.AWS_REGION;

const ses = new AWS.SES({ apiVersion: "2010-12-01" });
/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event, context) => {
  // insert code to be executed by your lambda trigger
  console.log(event);

  if (
    event.request.userAttributes.email &&
    event.triggerSource === "PostConfirmation_ConfirmSignUp"
  ) {
    await sendEmail(
      event.request.userAttributes.email,
      "Congratulations " + event.userName + ", you have been confirmed: "
    );
  } else {
    // Nothing to do, the user's email ID is unknown
    callback(null, event);
  }
  return event;
};

async function sendEmail(to, body) {
  var eParams = {
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Body: {
        Text: {
          Data: body
        }
      },
      Subject: {
        Data: "Cognito Identity Provider registration completed"
      }
    },

    // Replace source_email with your SES validated email address
    Source: "someemail"
  };
  const send = await ses.sendEmail(eParams).promise();
  console.log("EMAIL CODE END", send);
}
