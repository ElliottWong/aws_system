// should be replaced with AWS SES

const { aws: aws } = require('../config/config');

// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');

AWS.config.update({
    region: aws.region,
    accessKeyId: aws.accessKeyId,
    secretAccessKey: aws.secretAccessKey,
    mainEmail: aws.mainEmail
});

const nodemailer = require('nodemailer');

const { nodemailer: nm, frontend } = require('../config/config');

// const transporter = nodemailer.createTransport({
//   host: nm.hostname,
//   port: nm.port,
//   auth: {
//     user: nm.username,
//     pass: nm.password,
//   },
// });

module.exports.sendEmail = (recipient, subject, content) =>
    new Promise((resolve, reject) => {
        var params = {
            Destination: {
                //* Please use the identified email or else it cannot work
                ToAddresses: [recipient]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: content
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: subject
                }
            },
            //* Please use the identified email or else it cannot work
            Source: aws.mainEmail /* required */
        };

        // Create the promise and SES service object
        var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' })
            .sendEmail(params)
            .promise();

        // Handle promise's fulfilled/rejected states
        sendPromise
            .then(function (data, info) {
                console.log(data.MessageId);
                resolve(info);
            })
            .catch(function (err, error) {
                console.error(err, err.stack);
                reject(error);
            });
    });

// ============================================================

module.exports.sendBulkEmail = (recipients, contents) =>
    new Promise((resolve, reject) => { });

// ============================================================

// EMAIL TEMPLATES

const inviteUserHTML = (name, token) => `
    <h4>Hi ${name}!</h4>
    <p>You have been invited by a fellow colleague to join them in using eISO.</p>
    <p><strong><a href="${frontend.baseUrl}/create-account/${token}">Join Now</a></strong></p>
`;

const inviteFirstSysadminHTML = (name, token) => `
    <h4>Hi ${name}!</h4>
    <p>Welcome to eISO!</p>
    <p>You are being invited to setup your organisation's eISO.</p>
    <p><strong><a href="${frontend.baseUrl}/create-account/${token}">Setup Now</a></strong></p>
`;

const invitePlatformAdminHTML = (name, token) => `
    <h4>Hi ${name}!</h4>
    <p>You are being invited to administrate the eISO platform.</p>
    <p><strong><a href="${frontend.baseUrl}/create-account/${token}">Begin Now</a></strong></p>
`;

const requestOtpHTML = (name, otp) => `
    <h4>Hi ${name},</h4>
    <p>You have recently requested for an OTP. Your OTP is <strong>${otp}</strong>.</p>
    <p>The OTP will expire in 5 minutes.</p>
`;

const passwordChangedHTML = (name) => `
    <h4>Hi ${name},</h4>
    <p>You have recently changed your password for your eISO account.</p>
`;

const documentApprovalHTML = (approver, author, document, link, linkname) => `
    <h4>Hi ${approver},</h4>
    <p>${author} have created a new document for <strong>${document}</strong> and it required your confirmation in order to be active.</p>
    <p><strong><a href="${frontend.baseUrl}/${link}">Go to the ${linkname} now</a></strong></p>
`;

const documentRejectedHTML = (author, approver, document, link, linkname) => `
<h4>Hi ${author},</h4>
<p>${approver} have rejected the document for <strong>${document}</strong> and it required an update in order to be active.</p>
<p><strong><a href="${frontend.baseUrl}/${link}">Go to the ${linkname} now</a></strong></p>
`;

const updateSwotNoticeHTML = (name) => `
    <h4>Hi ${name}!</h4>
    <p>The current SWOT have not been updated for 11 months, please update again!</p>
    <p><strong><a href="${frontend.baseUrl}/swot">Go to the SWOT now</a></strong></p>
`;

const MaintenanceFirstNoticeForAssigneesOnlyHTML = (name, document) => `
    <h4>Hi ${name}!</h4>
    <p>The Maintenance of <strong>${document}</strong> that was assign to you was almost due, please update it</p>
    <p><strong><a href="${frontend.baseUrl}/equipment-maintenance">Go to the Equipment Maintenance now</a></strong></p>
`;

const MaintenanceSecondNoticeForAssigneesOnlyHTML = (name, document) => `
    <h4>Hi ${name}!</h4>
    <p>The Maintenance of <strong>${document}</strong> that was assign to you was over due, please update it</p>
    <p><strong><a href="${frontend.baseUrl}/equipment-maintenance">Go to the Equipment Maintenance now</a></strong></p>
`;

const MaintenanceSecondNoticeForCreatorOnlyHTML = (name, document) => `
    <h4>Hi ${name}!</h4>
    <p>The Maintenance of <strong>${document}</strong> that was created by you was over due, please update it</p>
    <p><strong><a href="${frontend.baseUrl}/equipment-maintenance">Go to the Equipment Maintenance now</a></strong></p>
`;

const LicenceFirstNoticeForAssigneesOnlyHTML = (name, license) => `
    <h4>Hi ${name}!</h4>
    <p>The License of <strong>${license}</strong> that was assign to you was almost expired, please upload a new one again</p>
    <p><strong><a href="${frontend.baseUrl}/licenses">Go to the Licenses now</a></strong></p>
`;

const LicenceSecondNoticeForAssigneesOnlyHTML = (name, license) => `
    <h4>Hi ${name}!</h4>
    <p>The License of <strong>${license}</strong> that was assign to you was already expired, please upload a new one again</p>
    <p><strong><a href="${frontend.baseUrl}/licenses">Go to the Licenses now</a></strong></p>
`;

const LicenceSecondNoticeForCreatorOnlyHTML = (name, license) => `
    <h4>Hi ${name}!</h4>
    <p>The License of <strong>${license}</strong> that was created by you was already expired, please upload a new one again</p>
    <p><strong><a href="${frontend.baseUrl}/licenses">Go to the Licenses now</a></strong></p>
`;


// ============================================================

module.exports.templates = {
    inviteUser: inviteUserHTML,
    inviteSystemAdmin: inviteFirstSysadminHTML,
    invitePlatformAdmin: invitePlatformAdminHTML,
    requestOtp: requestOtpHTML,
    passwordChanged: passwordChangedHTML,
    documentApproval: documentApprovalHTML,
    documentRejected: documentRejectedHTML,
    updateSwotNotice: updateSwotNoticeHTML,
    MaintenanceFirstNoticeForAssigneesOnly: MaintenanceFirstNoticeForAssigneesOnlyHTML,
    MaintenanceSecondNoticeForAssigneesOnly: MaintenanceSecondNoticeForAssigneesOnlyHTML,
    MaintenanceSecondNoticeForCreatorOnly: MaintenanceSecondNoticeForCreatorOnlyHTML,
    LicenceFirstNoticeForAssigneesOnly: LicenceFirstNoticeForAssigneesOnlyHTML,
    LicenceSecondNoticeForAssigneesOnly: LicenceSecondNoticeForAssigneesOnlyHTML,
    LicenceSecondNoticeForCreatorOnly: LicenceSecondNoticeForCreatorOnlyHTML
};
