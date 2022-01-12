//* node ses_listverifyemail.js

const { aws: aws } = require("./src/config/config");

// Load the AWS SDK for Node.js
const AWS = require("aws-sdk");

AWS.config.update({
  region: aws.region,
  accessKeyId: aws.accessKeyId,
  secretAccessKey: aws.secretAccessKey,
});

// Create listIdentities params
var params = {
  // "EmailAddress" or "Domain"
  IdentityType: "EmailAddress",
  MaxItems: 10,
};

// Create the promise and SES service object
var listIDsPromise = new AWS.SES({ apiVersion: "2010-12-01" })
  .listIdentities(params)
  .promise();

// Handle promise's fulfilled/rejected states
listIDsPromise
  .then(function (data) {
    console.log(data.Identities);
  })
  .catch(function (err) {
    console.error(err, err.stack);
  });
