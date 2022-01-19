// 12am update everythings
// - Check and compare the days and update in the system
// - System should automatically notify the last approver to review the SWOT 11 months after approval

//* 4.1 SWOT
const r = require('../utils/response').responses;

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

// Send email when 330 days reached 0
module.exports = () => {

    schedule.scheduleJob('0 0 * * *', async (where) => {
        const getSwotInformation = await SWOT.Forms.findAll({
            where: { status: 'active' }
        });

        for (const swot of getSwotInformation) {
            const swotID = swot.swot_id;
            const approverID = swot.approved_by;
            const dueDate = swot.due_at;
            const now = new Date();
            const result = differenceInCalendarDays(new Date(dueDate), new Date(now));

            const GetEmployeesInfo = await Employees.findAll({
                where: { employee_id: approverID }
            });

            for (const approverEmployees of GetEmployeesInfo) {
                const approverEmail = approverEmployees.email;
                const approverName = `${approverEmployees.firstname} ${approverEmployees.lastname}`;

                //330 = 11 months
                try {
                    if (result == 0) {
                        await SWOT.Forms.update(
                            {
                                due_at: null
                            },
                            { where: { swot_id: swotID } }
                        );
                        // console.log("\n email is ", approverEmail, "\n");
                        await sendEmail(
                            approverEmail,
                            'Update Needed for SWOT',
                            templates.updateSwotNotice(approverName)
                        );
                    }
                }
                catch (e) {
                    console.log('Email failed to send for approver');
                }
            }
        }
    });
};
