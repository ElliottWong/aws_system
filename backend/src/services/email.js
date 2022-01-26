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

//* INVITATION

const inviteUserHTML = (name, token) => `
<body style="font-family:system-ui; padding:0.5cm; font-size:0.4cm;">
<h2 style="font-size:0.7cm;">
   Hi ${name}
</h2>
  
<p style="font-size:0.5cm; padding-top:0.8cm; line-height: 2;">
  You have been invited by a fellow colleague to join them. 
</p>

<form style="padding-top:1cm;"action="${frontend.baseUrl}/create-account/${token}">
<input style="border-radius:8px; padding:15px 35px; background-color:#2b313b; color:white; font-weight:bold; 
font-size:0.4cm;" type="submit" value="Click to Join Now" />
</form>
  
</body>
`;

const inviteFirstSysadminHTML = (name, token) => `
<body style="font-family:system-ui; padding:0.5cm; font-size:0.4cm;">
<h2 style="font-size:0.7cm;">
   Hi ${name}
</h2>
  
<p style="font-size:0.5cm; padding-top:0.8cm; line-height: 2;">
  You are being invited to setup your organisation.
</p>

<form style="padding-top:1cm;"action="${frontend.baseUrl}/create-account/${token}">
<input style="border-radius:8px; padding:15px 35px; background-color:#2b313b; color:white; font-weight:bold; 
font-size:0.4cm;" type="submit" value="Click to Setup Now" />
</form>
  
</body>
`;

const invitePlatformAdminHTML = (name, token) => `
<body style="font-family:system-ui; padding:0.5cm; font-size:0.4cm;">
<h2 style="font-size:0.7cm;">
   Hi ${name}
</h2>
  
<p style="padding-top:0.8cm; font-size:0.6cm;">Welcome to eISO!</p>
  
<p style="line-height: 2;">You are being invited to administrate the <strong style="font-size:0.5cm;"> eISO System Platform</strong>. </p>
 
<form style="padding-top:1cm;"action="${frontend.baseUrl}/create-account/${token}">
<input style="border-radius:8px; padding:15px 35px; background-color:#2b313b; color:white; font-weight:bold; 
font-size:0.4cm;" type="submit" value="Click to Begin Now" />
</form>
  
</body>
`;


// error
const requestOtpHTML = (name, otp) => `
<body style="font-family:system-ui; padding:0.5cm; font-size:0.4cm;">
<h2 style="font-size:0.7cm;">
   Hi ${name}
</h2>
  
<p style="padding-top:0.8cm; line-height: 2;">You have recently requested for an OTP.</p>
 
<p>Your OTP is</p>
<p style="font-size:1cm;"><strong>${otp}</strong><p>
  
<p>The OTP will expire in <strong style="font-size:0.5cm; color:red">5 minutes</strong>.</p>
  
</body>
`;

// error
const passwordChangedHTML = (name) => `
<body style="font-family:system-ui; padding:0.5cm; font-size:0.4cm;">
<h2 style="font-size:0.7cm;">
   Hi ${name}
</h2>
  
<p style="padding-top:0.8cm; line-height: 2;">You have recently changed your password for your account.</p>
  
</body>
`;



//* For clauses 4.1, 4.2, 4.3, 5.2, 6.1, 6.2

const documentSendApprovalHTML = (approver, author, document, time, link, linkname) => `
<body style="font-family:system-ui; padding:0.5cm; font-size:0.4cm;">
<h2 style="font-size:0.7cm;">
   Hi ${approver}
</h2>
  
<p style="padding-top:0.8cm; line-height: 2;">
  <strong style="font-size:0.5cm;">${author}</strong>
  has created a new 
  <strong>${document}</strong> 
  document at <strong>${time}</strong>.
</p>
  
<p>It required your confirmation in order to be active.</p>  
  
<form style="padding-top:1cm;"action="${frontend.baseUrl}/${link}">
<input style="border-radius:8px; padding:15px 35px; background-color:#2b313b; color:white; font-weight:bold; 
font-size:0.5cm;" type="submit" value="Go to the ${linkname} now" />
</form>
  
</body>
`;

const documentApprovalHTML = (author, approver, document, time, link, linkname) => `
<body style="font-family:system-ui; padding:0.5cm; font-size:0.4cm;">
<h2 style="font-size:0.7cm;">
   Hi ${author}
</h2>
  
<p style="padding-top:0.8cm; line-height: 2;">
  <strong style="font-size:0.5cm;">${approver}</strong>
  has approved the 
  <strong>${document}</strong> 
  document at <strong>${time}</strong>.
</p>
  
<p>It will be available to be seen at the active tab!</p>  
  
<form style="padding-top:1cm;"action="${frontend.baseUrl}/${link}">
<input style="border-radius:8px; padding:15px 35px; background-color:#2b313b; color:white; font-weight:bold; 
font-size:0.5cm;" type="submit" value="Go to the ${linkname} now" />
</form>
  
</body>

`;

const documentRejectedHTML = (author, approver, document, time, remarks, link, linkname) => `
<body style="font-family:system-ui; padding:0.5cm; font-size:0.4cm;">
<h2 style="font-size:0.7cm;">
   Hi ${author}
</h2>
  
<p style="padding-top:0.8cm; line-height: 2;">
  <strong style="font-size:0.5cm;">${approver}</strong>
  have rejected the 
  <strong>${document}</strong> 
  document at <strong>${time}</strong>.
</p>
  
<p>Please update again as soon as possible!</p>  

<h3 style="padding-top:0.8cm; line-height: 2;">Remarks:</h3>
<p style="padding: 10px; color:black">${remarks}</p>
  
<form style="padding-top:1cm;"action="${frontend.baseUrl}/${link}">
<input style="border-radius:8px; padding:15px 35px; background-color:#2b313b; color:white; font-weight:bold; 
font-size:0.5cm;" type="submit" value="Go to the ${linkname} now" />
</form>
  
</body>
`;



//* For 7.1

const createAndUpdatedEquipmentHTML = (creator, status, Currentstatus, equipmentInfo, link, linkname) => `
<body style="font-family:system-ui; padding:0.5cm; font-size:0.4cm;">
<h2 style="font-size:0.7cm;">
   Hi ${creator}
</h2>
  
<p style="padding-top:0.8cm; padding-bottom:0.4cm; line-height: 2;">
You have successfully ${status} the Equipment.

<h3 style="padding-top:0.4cm; padding-bottom:0.4cm;">${Currentstatus} Equipment Information</h3>
${equipmentInfo}

<form style="padding-top:1cm;"action="${frontend.baseUrl}/${link}">
<input style="border-radius:8px; padding:15px 35px; background-color:#2b313b; color:white; font-weight:bold; 
font-size:0.5cm;" type="submit" value="Go to the ${linkname} now" />
</form>
  
</body>
`;

const addedAndUpdatedAssigneesInMaintenanceHTML = (assignees, creator, status, currentStatus, maintenanceInfo, link, linkname) => `
<body style="font-family:system-ui; padding:0.5cm; font-size:0.4cm;">
<h2 style="font-size:0.7cm;">
   Hi ${assignees}
</h2>
  
<p style="padding-top:0.8cm; padding-bottom:0.4cm; line-height: 2;">
  <strong style="font-size:0.5cm;">${creator}</strong>
have ${status} you to Maintenance.


<h3 style="padding-top:0.4cm; padding-bottom:0.4cm;">${currentStatus} Equipment Information</h3>
${maintenanceInfo}

  
<form style="padding-top:1cm;"action="${frontend.baseUrl}/${link}">
<input style="border-radius:8px; padding:15px 35px; background-color:#2b313b; color:white; font-weight:bold; 
font-size:0.5cm;" type="submit" value="Go to the ${linkname} now" />
</form>
  
</body>
`;

const createAndUpdatedMaintenanceHTML = (creator, status, currentStatus, maintenanceInfo, link, linkname) => `
<body style="font-family:system-ui; padding:0.5cm; font-size:0.4cm;">
<h2 style="font-size:0.7cm;">
   Hi ${creator}
</h2>
  
<p style="padding-top:0.8cm; line-height: 2;">
You have successfully ${status} the Maintenance.
</p>

<h3 style="padding-top:0.4cm; padding-bottom:0.4cm;">${currentStatus} Maintenance Information</h3>
${maintenanceInfo}

<form style="padding-top:1cm;"action="${frontend.baseUrl}/${link}">
<input style="border-radius:8px; padding:15px 35px; background-color:#2b313b; color:white; font-weight:bold; 
font-size:0.5cm;" type="submit" value="Go to the ${linkname} now" />
</form>
  
</body>
`;


//* For 7.2

const addedAndUpdatedAssigneesInLicenceHTML = (assignees, creator, status, currentStatus, licenceInfo, link, linkname) => `
<body style="font-family:system-ui; padding:0.5cm; font-size:0.4cm;">
<h2 style="font-size:0.7cm;">
   Hi ${assignees}
</h2>
  
<p style="padding-top:0.8cm; padding-bottom:0.4cm; line-height: 2;">
  <strong style="font-size:0.5cm;">${creator}</strong>
have ${status} you to Licence.

<h3 style="padding-top:0.4cm; padding-bottom:0.4cm;">${currentStatus} Licence Information</h3>
${licenceInfo}
  
<form style="padding-top:1cm;"action="${frontend.baseUrl}/${link}">
<input style="border-radius:8px; padding:15px 35px; background-color:#2b313b; color:white; font-weight:bold; 
font-size:0.5cm;" type="submit" value="Go to the ${linkname} now" />
</form>
  
</body>
`;

const createAndUpdatedLicenceHTML = (creator, status, currentStatus, licenceInfo, link, linkname) => `
<body style="font-family:system-ui; padding:0.5cm; font-size:0.4cm;">
<h2 style="font-size:0.7cm;">
   Hi ${creator}
</h2>
  
<p style="padding-top:0.8cm; line-height: 2;">
You have successfully ${status} the Licence.
</p>

<h3 style="padding-top:0.4cm; padding-bottom:0.4cm;">${currentStatus} Licence Information</h3>
${licenceInfo}

<form style="padding-top:1cm;"action="${frontend.baseUrl}/${link}">
<input style="border-radius:8px; padding:15px 35px; background-color:#2b313b; color:white; font-weight:bold; 
font-size:0.5cm;" type="submit" value="Go to the ${linkname} now" />
</form>
  
</body>
`;


//* For 7.3

const documentSendApprovalTrainingHTML = (approver, author, trainingInfo, link, linkname) => `
<body style="font-family:system-ui; padding:0.5cm; font-size:0.4cm;">
<h2 style="font-size:0.7cm;">
   Hi ${approver}
</h2>
  
<p style="padding-top:0.8cm; line-height: 2;">
  <strong style="font-size:0.5cm;">${author}</strong>
  has created a new training request.
</p>
  
<p>It required your confirmation at Training Requests pending for your approval.</p>  

<h3 style="padding-top:0.4cm; padding-bottom:0.4cm;">Created Training Requests</h3>
${trainingInfo}

<form style="padding-top:1cm;"action="${frontend.baseUrl}/${link}">
<input style="border-radius:8px; padding:15px 35px; background-color:#2b313b; color:white; font-weight:bold; 
font-size:0.5cm;" type="submit" value="Go to the ${linkname} now" />
</form>
  
</body>
`;

/*
<h3 style="padding-top:0.4cm; padding-bottom:0.4cm;">Approval Training Requests</h3>
${trainingInfo}
*/

const documentApprovalTrainingHTML = (author, approver, /*trainingInfo,*/ link, linkname) => `
<body style="font-family:system-ui; padding:0.5cm; font-size:0.4cm;">
<h2 style="font-size:0.7cm;">
   Hi ${author}
</h2>
  
<p style="padding-top:0.8cm; line-height: 2;">
  <strong style="font-size:0.5cm;">${approver}</strong>
  has approved the training request.
</p>
  
<p>It will be available in All Training Requests (Under your approval)</p>  



<form style="padding-top:1cm;"action="${frontend.baseUrl}/${link}">
<input style="border-radius:8px; padding:15px 35px; background-color:#2b313b; color:white; font-weight:bold; 
font-size:0.5cm;" type="submit" value="Go to the ${linkname} now" />
</form>
  
</body>

`;

const documentRejectedTrainingHTML = (author, approver, remarks, /*trainingInfo,*/ link, linkname) => `
<body style="font-family:system-ui; padding:0.5cm; font-size:0.4cm;">
<h2 style="font-size:0.7cm;">
   Hi ${author}
</h2>
  
<p style="padding-top:0.8cm; line-height: 2;">
  <strong style="font-size:0.5cm;">${approver}</strong>
  have rejected the training request.
</p>
  
<p>Please update again as soon as possible!</p>  

<h3 style="padding-top:0.8cm; line-height: 2;">Remarks:</h3>
<p style="padding: 10px; color:black">${remarks}</p>

<form style="padding-top:1cm;"action="${frontend.baseUrl}/${link}">
<input style="border-radius:8px; padding:15px 35px; background-color:#2b313b; color:white; font-weight:bold; 
font-size:0.5cm;" type="submit" value="Go to the ${linkname} now" />
</form>
  
</body>
`;


//* Schedules for 4.1, 7.1, 7.2

const updateSwotNoticeHTML = (name) => `
<body style="font-family:system-ui; padding:0.5cm; font-size:0.4cm;">
<h2 style="font-size:0.7cm;">
   Hi ${name}
</h2>
  
<p style="padding-top:0.8cm; line-height: 2;">
The current <strong>SWOT</strong> have not been updated for 11 months.
</p>
  
<p>Please update it as soon as possible!</p>

<form style="padding-top:1cm;"action="${frontend.baseUrl}/swot">
<input style="border-radius:8px; padding:15px 35px; background-color:#2b313b; color:white; font-weight:bold; 
font-size:0.5cm;" type="submit" value="Go to the SWOT now" />
</form>

</body>
`;

const equipmentMaintenanceScheduleNoticeHTML = (name, type, equipmentName, typeOfAssign, status, equipmentID, maintenceID) => `
<body style="font-family:system-ui; padding:0.5cm; font-size:0.4cm;">
<h2 style="font-size:0.7cm;">
   Hi ${name}
</h2>
  
<p style="padding-top:0.8cm; line-height: 2;">
The Maintenance Cycles<strong> ${type} </strong> in equipment <strong> ${equipmentName} </strong>
  that was ${typeOfAssign} you was ${status} due.
</p>
  
<p>Please update it as soon as possible!</p>

<form style="padding-top:1cm;"action="${frontend.baseUrl}/equipment-maintenance/manage-equipment/${equipmentID}/manage-cycle/${maintenceID}">
<input style="border-radius:8px; padding:15px 35px; background-color:#2b313b; color:white; font-weight:bold; 
font-size:0.5cm;" type="submit" value="Go to the Equipment Maintenance now" />
</form>
  
</body>
`;

const licenceScheduleNoticeHTML = (name, type, typeOfAssign, status, licenceID) => `
<body style="font-family:system-ui; padding:0.5cm; font-size:0.4cm;">
<h2 style="font-size:0.7cm;">
   Hi ${name}
</h2>
  
<p style="padding-top:0.8cm; line-height: 2;">
The Licence<strong> ${type} </strong> that was ${typeOfAssign} you was ${status}.
</p>
  
<p>Please update it as soon as possible!</p>

<form style="padding-top:1cm;"action="${frontend.baseUrl}/licenses/manage-license/${licenceID}">
<input style="border-radius:8px; padding:15px 35px; background-color:#2b313b; color:white; font-weight:bold; 
font-size:0.5cm;" type="submit" value="Go to the Licence now" />
</form>
  
</body>
`;

// ============================================================

module.exports.templates = {
    inviteUser: inviteUserHTML,
    inviteSystemAdmin: inviteFirstSysadminHTML,
    invitePlatformAdmin: invitePlatformAdminHTML,
    requestOtp: requestOtpHTML,
    passwordChanged: passwordChangedHTML,
    documentSendApproval: documentSendApprovalHTML,
    documentApproval: documentApprovalHTML,
    documentRejected: documentRejectedHTML,

    createAndUpdatedEquipment: createAndUpdatedEquipmentHTML,
    addedAndUpdatedAssigneesInMaintenance: addedAndUpdatedAssigneesInMaintenanceHTML,
    createAndUpdatedMaintenance: createAndUpdatedMaintenanceHTML,

    addedAndUpdatedAssigneesInLicence: addedAndUpdatedAssigneesInLicenceHTML,
    createAndUpdatedLicence: createAndUpdatedLicenceHTML,

    documentSendApprovalTraining:documentSendApprovalTrainingHTML,
    documentApprovalTraining: documentApprovalTrainingHTML,
    documentRejectedTraining: documentRejectedTrainingHTML,

    updateSwotNotice: updateSwotNoticeHTML,
    equipmentMaintenanceScheduleNotice: equipmentMaintenanceScheduleNoticeHTML,
    licenceScheduleNotice: licenceScheduleNoticeHTML
};
