// 12am update everythings
// - Check and compare the days and update in the system
// - Less than 20% send email to assign people

//* 7.2 Licences
const r = require('../utils/response').responses;

const {
    Employees,
    Documents: { PLC }
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

// Update table everyday when a day have change
module.exports = () => {

    schedule.scheduleJob('0 0 * * *', async (where) => {
        const getLicencesInformation = await PLC.Licences.findAll({
            where: {}
        });

        for (const licences of getLicencesInformation) {
            const licenceID = licences.licence_id;
            const issued = licences.issued_at;
            const expires = licences.expires_at;

            const now = new Date();
            const changeDiff = differenceInCalendarDays(
                new Date(expires),
                new Date(now)
            );

            const orginalDiff = differenceInCalendarDays(
                new Date(expires),
                new Date(issued)
            );

            const days = changeDiff;
            const percentage = (changeDiff / orginalDiff) * 100;

            try {
                await PLC.Licences.update(
                    {
                        days_left: days,
                        days_left_pct: percentage
                    },
                    { where: { licence_id: licenceID } }
                );
            }
            catch (error) {
                console.log('Fail to update');
            }
        }
    });

    // Creator Schedule Email
    schedule.scheduleJob('5 0 0 * * *', async (where) => {
        const getLicencesInformation = await PLC.Licences.findAll({
            where: {}
        });

        for (const licences of getLicencesInformation) {
            const licenceID = licences.licence_id;
            const createdByID = licences.created_by;
            const licenceFirstNotification = licences.first_notification;
            const licenceSecondNotification = licences.second_notification;
            const daysLeft = licences.days_left;

            const getCreatorEmployeesInfo = await Employees.findAll({
                where: { employee_id: createdByID }
            });

            for (const creatorEmployees of getCreatorEmployeesInfo) {
                const creatorEmail = creatorEmployees.email;
                const creatorName = `${creatorEmployees.firstname} ${creatorEmployees.lastname}`;

                try {
                    if (
                        daysLeft <= -2 &&
                        licenceFirstNotification == 1 &&
                        licenceSecondNotification == 0
                    ) {
                        await PLC.Licences.update(
                            {
                                second_notification: 1
                            },
                            { where: { licence_id: licenceID } }
                        );
                        // console.log(`\n`, "Creator Email", creatorEmail, `\n`);
                        await sendEmail(
                            creatorEmail,
                            `2nd Notification for Licence Expired`,
                            templates.licenceScheduleNotice(
                                creatorName,
                                `${licences.licence_name}`,
                                'created by', 
                                'expired', 
                                `${licenceID}`
                            )
                        );
                    }
                }
                catch (e) {
                    console.log('Email failed to send, email for creator');
                }
            }
        }
    });

    // Assignees Schedule Emails
    schedule.scheduleJob('5 0 0 * * *', async (where) => {
        const getLicencesInformation = await PLC.Licences.findAll({
            where: {}
        });

        for (const licences of getLicencesInformation) {
            const licenceID = licences.licence_id;
            const licenceFirstNotification = licences.first_notification;
            const licenceSecondNotification = licences.second_notification;
            const daysLeft = licences.days_left;
            const daysPercentage = licences.days_left_pct;

            const GetAssignees = await PLC.Assignees.findAll({
                where: { fk_licence_id: licenceID }
            });

            for (const assignees of GetAssignees) {
                const employeeID = assignees.fk_employee_id;

                const getAssigneesEmployeesInfo = await Employees.findAll({
                    where: { employee_id: employeeID }
                });

                for (const assigneesEmployees of getAssigneesEmployeesInfo) {
                    const assigneesEmail = assigneesEmployees.email;
                    const assigneesName = `${assigneesEmployees.firstname} ${assigneesEmployees.lastname}`;

                    try {
                        if (
                            daysPercentage < 20 &&
                            licenceFirstNotification == 0 &&
                            licenceSecondNotification == 0
                        ) {
                            await PLC.Licences.update(
                                {
                                    first_notification: 1
                                },
                                { where: { licence_id: licenceID } }
                            );
                            // console.log(`\n`, "Assign Email", assigneesEmail, `\n`);
                          
                            await sendEmail(
                                assigneesEmail,
                                `1st Notification for Licence Almost Expired`,
                                templates.licenceScheduleNotice(
                                    assigneesName,
                                    `${licences.licence_name}`,
                                    'assign to', 
                                    'almost expired', 
                                    `${licenceID}`
                                )
                            );
                        }
                    }
                    catch (e) {
                        console.log('Email failed to send, 1st email for assignees');
                    }

                    try {
                        if (
                            daysLeft <= -2 &&
                            licenceFirstNotification == 1 &&
                            licenceSecondNotification == 0
                        ) {
                            await PLC.Licences.update(
                                {
                                    second_notification: 1
                                },
                                { where: { licence_id: licenceID } }
                            );
                            // console.log(`\n`, "Assign Email", assigneesEmail, `\n`);
                            await sendEmail(
                                assigneesEmail,
                                `2nd Notification for Licence Expired`,
                                templates.licenceScheduleNotice(
                                    assigneesName,
                                    `${licences.licence_name}`,
                                    'assign to', 
                                    'expired', 
                                    `${licenceID}`
                                )
                            );
                        }
                    }
                    catch (e) {
                        console.log('Email failed to send, 2nd email for assignees');
                    }
                }
            }
        }
    });

    // If both 1 in first and second notcation in database, it would make the days_left and days_left_pct to 0
    schedule.scheduleJob('5 0 0 * * *', async (where) => {
        const getLicencesInformation = await PLC.Licences.findAll({
            where: {}
        });

        for (const licences of getLicencesInformation) {
            const licenceID = licences.licence_id;
            const licencesFirstNotification = licences.first_notification;
            const licencesSecondNotification = licences.second_notification;

            try {
                if (licencesFirstNotification == 1 && licencesSecondNotification == 1) {
                    await PLC.Licences.update(
                        {
                            days_left: 0,
                            days_left_pct: 0
                        },
                        { where: { licence_id: licenceID } }
                    );
                }
            }
            catch (error) {
                console.log('Fail to update');
            }
        }
    });

    // If no expired date, it would make the days_left and days_left_pct to 0
    schedule.scheduleJob('5 0 0 * * *', async (where) => {
        const getLicencesInformation = await PLC.Licences.findAll({
            where: {}
        });

        for (const licences of getLicencesInformation) {
            const licenceID = licences.licence_id;
            const licencesFirstNotification = licences.first_notification;
            const licencesSecondNotification = licences.second_notification;

            try {
                if (
                    licencesFirstNotification == 0 &&
                    licencesSecondNotification == 0
                ) {
                    await PLC.Licences.update(
                        {
                            days_left: null,
                            days_left_pct: null
                        },
                        { where: { licence_id: licenceID } }
                    );
                }
            }
            catch (error) {
                console.log('Fail to update');
            }
        }
    });
};
