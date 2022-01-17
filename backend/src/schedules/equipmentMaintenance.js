// 12am update everythings
// - Check and compare the days and update in the system
// - less than 40% send email to assign people
// - after due, two days send email to the assign people and send to the creater of the equipment row

//* 7.1

const {
  Employees,
  Documents: { EMP },
} = require("../schemas/Schemas");

const { sendEmail, templates } = require("../services/email");

const differenceInCalendarDays = require("date-fns/differenceInCalendarDays");

const schedule = require("node-schedule");
const { aws: aws } = require("../config/config");
// Load the AWS SDK for Node.js
const AWS = require("aws-sdk");

AWS.config.update({
  region: aws.region,
  accessKeyId: aws.accessKeyId,
  secretAccessKey: aws.secretAccessKey,
});

// Update table everyday when a day have change
schedule.scheduleJob("* * * * *", async (where) => {
  const getMaintenanceInformation = await EMP.Maintenance.findAll({
    where: {},
  });

  for (const maintenance of getMaintenanceInformation) {
    //* Get the Data from the Table Licenses
    const lastServiceAt = maintenance.last_service_at;
    const nextServiceAt = maintenance.next_service_at;

    //* Date Diff
    const now = new Date();
    const changeDiff = differenceInCalendarDays(
      new Date(nextServiceAt),
      new Date(now)
    );

    // totalDays
    const orginalDiff = differenceInCalendarDays(
      new Date(nextServiceAt),
      new Date(lastServiceAt)
    );

    //* Days and Percentage
    const days = changeDiff;
    const percentage = (changeDiff / orginalDiff) * 100;

    //* Update everyday in the days_left and days_left_percentage
    //* In each of the Maintenance rows
    await EMP.Maintenance.update(
      {
        days_left: days,
        days_left_pct: percentage,
      },
      { where: { maintenance_id: maintenance.maintenance_id } }
    );
  }
});

// Creator Schedule Email
schedule.scheduleJob("5 * * * * *", async (where) => {
  const getMaintenanceInformation = await EMP.Maintenance.findAll({
    where: {},
  });

  for (const maintenance of getMaintenanceInformation) {
    //* Get the Data from the Table Licenses
    const maintenanceID = maintenance.maintenance_id;
    const MaintenanceSecondNotification = maintenance.second_notification;
    const daysLeft = maintenance.days_left;
    const equipmentID = maintenance.fk_equipment_id;

    const getEquipmentInformation = await EMP.Equipment.findAll({
      where: { equipment_id: equipmentID },
    });

    for (const equipmentInfo of getEquipmentInformation) {
      const creatorID = equipmentInfo.created_by;

      const getCreatorInformation = await Employees.findAll({
        where: { employee_id: creatorID },
      });

      for (const creatorEmployees of getCreatorInformation) {
        const creatorEmail = creatorEmployees.email;

        //* If detected Days = -2, update
        //* second_notication to 1 then sendEmail
        if (daysLeft == -2 && MaintenanceSecondNotification == 0) {
          try {
            await EMP.Maintenance.update(
              {
                second_notification: 1,
              },
              { where: { maintenance_id: maintenance.maintenance_id } }
            );

            const assigneesName = `${creatorEmployees.firstname} ${creatorEmployees.lastname}`;

            console.log(`\n`, "Assign Email", creatorEmail, `\n`);
            await sendEmail(
              creatorEmail,
              `2nd Notification for ${maintenance.type} Expired`,
              templates.MaintenanceSecondNotice(
                assigneesName,
                `${maintenance.type}`
              )
            );
          } catch (e) {
            throw new Error("Email failed to send");
          }
        }
      }
    }
  }
});

// Assignees Schedule Emails
schedule.scheduleJob("5 * * * * *", async (where) => {
  const getMaintenanceInformation = await EMP.Maintenance.findAll({
    where: {},
  });

  for (const maintenance of getMaintenanceInformation) {
    //* Get the Data from the Table Licenses
    const maintenanceID = maintenance.maintenance_id;
    const maintenanceFirstNotification = maintenance.first_notification;
    const MaintenanceSecondNotification = maintenance.second_notification;
    const daysLeft = maintenance.days_left;
    const daysPercentage = maintenance.days_left_pct;

    //* Find the Assign Employees by using the linked maintenance_id
    //* as fk_licence_id
    const GetAssignees = await EMP.MaintenanceAssignees.findAll({
      where: { fk_mnt_id: maintenanceID },
    });

    for (const assignees of GetAssignees) {
      const employeeID = assignees.fk_usr_id;

      const getAssigneesEmployeesInfo = await Employees.findAll({
        where: { employee_id: employeeID },
      });

      for (const assigneesEmployees of getAssigneesEmployeesInfo) {
        const assigneesEmail = assigneesEmployees.email;

        //* If detected Percentage is less than 20%, update
        //* first_notication to 1 then sendEmail
        if (daysPercentage < 40 && maintenanceFirstNotification == 0) {
          try {
            await EMP.Maintenance.update(
              {
                first_notification: 1,
              },
              { where: { maintenance_id: maintenance.maintenance_id } }
            );
            const assigneesName = `${assigneesEmployees.firstname} ${assigneesEmployees.lastname}`;

            console.log(`\n`, "Assign Email", assigneesEmail, `\n`);
            await sendEmail(
              assigneesEmail,
              `1st Notification for ${maintenance.type} Expires`,
              templates.MaintenanceFirstNotice(
                assigneesName,
                `${maintenance.type}`
              )
            );
          } catch (e) {
            throw new Error("Email failed to send");
          }
        }

        //* If detected Days = -2, update
        //* second_notication to 1 then sendEmail
        if (daysLeft == -2 && MaintenanceSecondNotification == 0) {
          try {
            await EMP.Maintenance.update(
              {
                second_notification: 1,
              },
              { where: { maintenance_id: maintenance.maintenance_id } }
            );

            const assigneesName = `${assigneesEmployees.firstname} ${assigneesEmployees.lastname}`;

            console.log(`\n`, "Assign Email", assigneesEmail, `\n`);
            await sendEmail(
              assigneesEmail,
              `2nd Notification for ${maintenance.type} Expired`,
              templates.MaintenanceSecondNotice(
                assigneesName,
                `${maintenance.type}`
              )
            );
          } catch (e) {
            throw new Error("Email failed to send");
          }
        }
      }
    }
  }
});

// If both first and second notication == 1, it would make the days_left and days_left_pct to 0
schedule.scheduleJob("5 * * * * *", async (where) => {
  const getMaintenanceInformation = await EMP.Maintenance.findAll({
    where: {},
  });

  for (const maintenance of getMaintenanceInformation) {
    //* Get the Data from the Table Licenses
    const maintenanceFirstNotification = maintenance.first_notification;
    const MaintenanceSecondNotification = maintenance.second_notification;

    //* Update everyday in the days_left and days_left_percentage
    //* In each of the licenese rows

    if (
      maintenanceFirstNotification == 1 &&
      MaintenanceSecondNotification == 1
    ) {
      await EMP.Maintenance.update(
        {
          days_left: 0,
          days_left_pct: 0,
        },
        { where: { maintenance_id: maintenance.maintenance_id } }
      );
    }
  }
});
