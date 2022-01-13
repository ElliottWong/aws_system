// 12am update everythings
// - Check and compare the days and update in the system
// - Less than 20% send email to assign people?

//* 7.2

const moment = require("moment"); // require
moment.suppressDeprecationWarnings = true;
const { sendEmail, templates } = require("../services/email");
const schedule = require("node-schedule");

const { aws: aws } = require("../config/config");

// Load the AWS SDK for Node.js
const AWS = require("aws-sdk");

AWS.config.update({
  region: aws.region,
  accessKeyId: aws.accessKeyId,
  secretAccessKey: aws.secretAccessKey,
});

