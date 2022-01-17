// 12am update everythings
// - Check and compare the days and update in the system
// - System should automatically notify the last approver to review the SWOT 11 months after approval

//* 4.1 SWOT

const {
    Employees,
    Documents: { SWOT }
} = require('../schemas/Schemas');

const { sendEmail, templates } = require('../services/email');

const differenceInCalendarDays = require('date-fns/differenceInCalendarDays');

const schedule = require('node-schedule');
const { aws: aws } = require('../config/config');
// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');

AWS.config.update({
    region: aws.region,
    accessKeyId: aws.accessKeyId,
    secretAccessKey: aws.secretAccessKey
});

schedule.scheduleJob('* * * * *', async (where) => {
    const getSwotInformation = await SWOT.Forms.findAll({
        where: { status: 'active' }
    });

    for (const swot of getSwotInformation) {
        const approverID = swot.approved_by;
        const dueDate = swot.dueDate_at;
        const now = new Date();
        const result = differenceInCalendarDays(new Date(dueDate), new Date(now));

        const GetEmployeesInfo = await Employees.findAll({
            where: { employee_id: approverID }
        });

        for (const employees of GetEmployeesInfo) {
            const approverEmail = employees.email;

            //330 = 11 months
            try {
                //* later change to 0
                if (result === 0) {
                    console.log('\n email is ', approverEmail, '\n');
                    const name = `${employees.firstname} ${employees.lastname}`;
                    await sendEmail(
                        approverEmail,
                        'Update Needed for SWOT',
                        templates.updateSwotNotice(name)
                    );
                }
            }
            catch (e) {
                throw new Error('Email failed to send');
            }
        }
    }
});
