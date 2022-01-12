const config = require('../../config/config');

// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');

AWS.config.update({
    region: config.aws.region,
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
});


//------------------------------------------------------------------------------
// Update every 12am
//------------------------------------------------------------------------------



