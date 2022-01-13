// 12am update everythings
// - Check and compare the days and update in the system
// - less than 40% send email to assign people
// - after due, two days send email to the assign people and send to the creater of the equipment row

//* 7.1

const moment = require("moment"); // require
moment.suppressDeprecationWarnings = true;

const schedule = require("node-schedule");

const { aws: aws } = require("../config/config");

// Load the AWS SDK for Node.js
const AWS = require("aws-sdk");

AWS.config.update({
  region: aws.region,
  accessKeyId: aws.accessKeyId,
  secretAccessKey: aws.secretAccessKey,
});
