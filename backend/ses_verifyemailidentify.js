//* node ses_verifyemailidentify.js

const { aws: aws } = require("./src/config/config");

// Load the AWS SDK for Node.js
const AWS = require("aws-sdk");

AWS.config.update({
  region: aws.region,
  accessKeyId: aws.accessKeyId,
  secretAccessKey: aws.secretAccessKey,
  verifyEmail: aws.verifyEmail
});

// Create promise and SES service object
var verifyEmailPromise = new AWS.SES({ apiVersion: "2010-12-01" })
  .verifyEmailIdentity({ EmailAddress: aws.verifyEmail })
  .promise();

// Handle promise's fulfilled/rejected states
verifyEmailPromise
  .then(function (data) {
    console.log("First Email verification initiated");
  })
  .catch(function (err) {
    console.error(err, err.stack);
  });

