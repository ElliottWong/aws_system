// 12am update everythings
// - Check and compare the days and update in the system
// - less than 40% send email to assign people
// - after due, two days send email to the assign people and send to the creator of the equipment row

//* 7.1
const r = require('../utils/response').responses;

const {
    Employees,
    Documents: { EMP }
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
module.exports = () => {

    // Update table everyday when a day have change
    schedule.scheduleJob('0 0 * * *', async (where) => {
        const getMaintenanceInformation = await EMP.Maintenance.findAll({
            where: {}
        });

        for (const maintenance of getMaintenanceInformation) {
            const maintenanceID = maintenance.maintenance_id;
            const lastServiceAt = maintenance.last_service_at;
            const nextServiceAt = maintenance.next_service_at;

            const now = new Date();
            const changeDiff = differenceInCalendarDays(
                new Date(nextServiceAt),
                new Date(now)
            );

            const orginalDiff = differenceInCalendarDays(
                new Date(nextServiceAt),
                new Date(lastServiceAt)
            );

            const days = changeDiff;
            const percentage = (changeDiff / orginalDiff) * 100;

            try {
                await EMP.Maintenance.update(
                    {
                        days_left: days,
                        days_left_pct: percentage
                    },
                    { where: { maintenance_id: maintenanceID } }
                );
            }
            catch (error) {
                console.log('Fail to update');
            }
        }
    });

    // Creator Schedule Email
    schedule.scheduleJob('5 0 0 * * *', async (where) => {
        const getMaintenanceInformation = await EMP.Maintenance.findAll({
            where: {}
        });

        for (const maintenance of getMaintenanceInformation) {
            const maintenanceID = maintenance.maintenance_id;
            const maintenanceFirstNotification = maintenance.first_notification;
            const MaintenanceSecondNotification = maintenance.second_notification;
            const daysLeft = maintenance.days_left;
            const equipmentID = maintenance.fk_equipment_id;

            const getEquipmentInformation = await EMP.Equipment.findAll({
                where: { equipment_id: equipmentID }
            });

            for (const equipmentInfo of getEquipmentInformation) {
                const creatorID = equipmentInfo.created_by;

                const getCreatorInformation = await Employees.findAll({
                    where: { employee_id: creatorID }
                });

                for (const creatorEmployees of getCreatorInformation) {
                    const creatorEmail = creatorEmployees.email;
                    const creatorName = `${creatorEmployees.firstname} ${creatorEmployees.lastname}`;

                    try {
                        if (
                            daysLeft == -2 &&
                            maintenanceFirstNotification == 1 &&
                            MaintenanceSecondNotification == 0
                        ) {
                            await EMP.Maintenance.update(
                                {
                                    second_notification: 1
                                },
                                { where: { maintenance_id: maintenanceID } }
                            );
                            // console.log(`\n`, "Assign Email", creatorEmail, `\n`);
                            await sendEmail(
                                creatorEmail,
                                `2nd Notification for ${maintenance.type} Expired`,
                                templates.MaintenanceSecondNoticeForCreatorOnly(
                                    creatorName,
                                    `${maintenance.type}`
                                )
                            );
                        }
                    }
                    catch (e) {
                        console.log('Email failed to send, email for creator');
                    }
                }
            }
        }
    });

    // Assignees Schedule Emails
    schedule.scheduleJob('5 0 0 * * *', async (where) => {
        const getMaintenanceInformation = await EMP.Maintenance.findAll({
            where: {}
        });

        for (const maintenance of getMaintenanceInformation) {
            const maintenanceID = maintenance.maintenance_id;
            const maintenanceFirstNotification = maintenance.first_notification;
            const MaintenanceSecondNotification = maintenance.second_notification;
            const daysLeft = maintenance.days_left;
            const daysPercentage = maintenance.days_left_pct;

            const GetMaintenanceAssignees = await EMP.MaintenanceAssignees.findAll({
                where: { fk_mnt_id: maintenanceID }
            });

            for (const assignees of GetMaintenanceAssignees) {
                const employeeID = assignees.fk_usr_id;

                const getAssigneesEmployeesInfo = await Employees.findAll({
                    where: { employee_id: employeeID }
                });

                for (const assigneesEmployees of getAssigneesEmployeesInfo) {
                    const assigneesEmail = assigneesEmployees.email;
                    const assigneesName = `${assigneesEmployees.firstname} ${assigneesEmployees.lastname}`;

                    try {
                        if (
                            daysPercentage < 40 &&
                            maintenanceFirstNotification == 0 &&
                            MaintenanceSecondNotification == 0
                        ) {
                            await EMP.Maintenance.update(
                                {
                                    first_notification: 1
                                },
                                { where: { maintenance_id: maintenanceID } }
                            );
                            // console.log(`\n`, "Assign Email", assigneesEmail, `\n`);
                            await sendEmail(
                                assigneesEmail,
                                `1st Notification for ${maintenance.type} Expires`,
                                templates.MaintenanceFirstNoticeForAssigneesOnly(
                                    assigneesName,
                                    `${maintenance.type}`
                                )
                            );
                        }
                    }
                    catch (e) {
                        console.log('Email failed to send, 1st email for assignees');
                    }

                    try {
                        if (
                            daysLeft == -2 &&
                            maintenanceFirstNotification == 1 &&
                            MaintenanceSecondNotification == 0
                        ) {
                            await EMP.Maintenance.update(
                                {
                                    second_notification: 1
                                },
                                { where: { maintenance_id: maintenanceID } }
                            );
                            // console.log(`\n`, "Assign Email", assigneesEmail, `\n`);
                            await sendEmail(
                                assigneesEmail,
                                `2nd Notification for ${maintenance.type} Expired`,
                                templates.MaintenanceSecondNoticeForAssigneesOnly(
                                    assigneesName,
                                    `${maintenance.type}`
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

    // If both first and second notication == 1, it would make the days_left and days_left_pct to 0
    schedule.scheduleJob('5 0 0 * * *', async (where) => {
        const getMaintenanceInformation = await EMP.Maintenance.findAll({
            where: {}
        });

        for (const maintenance of getMaintenanceInformation) {
            const maintenanceID = maintenance.maintenance_id;
            const maintenanceFirstNotification = maintenance.first_notification;
            const MaintenanceSecondNotification = maintenance.second_notification;

            try {
                if (
                    maintenanceFirstNotification == 1 &&
                    MaintenanceSecondNotification == 1
                ) {
                    await EMP.Maintenance.update(
                        {
                            days_left: 0,
                            days_left_pct: 0
                        },
                        { where: { maintenance_id: maintenanceID } }
                    );
                }
            }
            catch (error) {
                console.log('Fail to update');
            }
        }
    });
};
