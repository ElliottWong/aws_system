// 12am update everythings
// - Check and compare the days and update in the system
// - Less than 20% send email to assign people?

//* TODO: Change the days_left and days_left_pct to be able to negative numbers

//* Question
//* Second email send to the assign people and the creater?

//* Now only send to assign people

//* 7.2 Licences

const {
  Employees,
  Documents: { PLC },
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
  const getLicencesInformation = await PLC.Licences.findAll({
    where: {},
  });

  for (const licences of getLicencesInformation) {
    //* Get the Data from the Table Licenses
    const issued = licences.issued_at;
    const expires = licences.expires_at;

    //* Date Diff
    const now = new Date();
    const changeDiff = differenceInCalendarDays(
      new Date(expires),
      new Date(now)
    );
    const orginalDiff = differenceInCalendarDays(
      new Date(expires),
      new Date(issued)
    );

    //* Days and Percentage
    const days = changeDiff;
    const percentage = (changeDiff / orginalDiff) * 100;

    //* Update everyday in the days_left and days_left_percentage
    //* In each of the licenese rows
    await PLC.Licences.update(
      {
        days_left: days,
        days_left_pct: percentage,
      },
      { where: { licence_id: licences.licence_id } }
    );
  }
});

// Creator Schedule Email
schedule.scheduleJob("5 * * * * *", async (where) => {
  const getLicencesInformation = await PLC.Licences.findAll({
    where: {},
  });

  for (const licences of getLicencesInformation) {
    //* Get the Data from the Table Licenses
    const createdByID = licences.created_by;
    const licenseIDSecondNotification = licences.second_notification;
    const daysLeft = licences.days_left;

    const getCreaterEmployeesInfo = await Employees.findAll({
      where: { employee_id: createdByID },
    });

    for (const createrEmployees of getCreaterEmployeesInfo) {
      const createrEmail = createrEmployees.email;

      //* If detected Days = -2, update
      //* second_notication to 1 then sendEmail
      if (daysLeft == -2 && licenseIDSecondNotification == 0) {
        try {
          await PLC.Licences.update(
            {
              second_notification: 1,
              expires_at: null,
            },
            { where: { licence_id: licences.licence_id } }
          );
          const createrName = `${createrEmployees.firstname} ${createrEmployees.lastname}`;

          console.log(`\n`, "Creater Email", createrEmail, `\n`);
          await sendEmail(
            createrEmail,
            `2nd Notification for ${licences.licence_name} Expired`,
            templates.LicenseSecondNotice(createrName, `${licences.licence_name}`)
          );
        } catch (e) {
          throw new Error("Email failed to send");
        }
      }
    }
  }
});

// Assignees Schedule Emails 
schedule.scheduleJob("5 * * * * *", async (where) => {
  const getLicencesInformation = await PLC.Licences.findAll({
    where: {},
  });

  for (const licences of getLicencesInformation) {
    //* Get the Data from the Table Licenses
    const licenseID = licences.licence_id;
    const licenseIDFirstNotification = licences.first_notification;
    const licenseIDSecondNotification = licences.second_notification;
    const daysLeft = licences.days_left;
    const daysPercentage = licences.days_left_pct;

    //* Find the Assign Employees by using the linked licences_id
    //* as fk_licence_id
    const GetAssignees = await PLC.Assignees.findAll({
      where: { fk_licence_id: licenseID },
    });

    for (const assignees of GetAssignees) {
      const employeeID = assignees.fk_employee_id;

      const getAssigneesEmployeesInfo = await Employees.findAll({
        where: { employee_id: employeeID },
      });

      for (const assigneesEmployees of getAssigneesEmployeesInfo) {
        const assigneesEmail = assigneesEmployees.email;

        //* If detected Percentage is less than 20%, update
        //* first_notication to 1 then sendEmail
        if (daysPercentage < 20 && licenseIDFirstNotification == 0) {
          try {
            await PLC.Licences.update(
              {
                first_notification: 1,
              },
              { where: { licence_id: licences.licence_id } }
            );
            const assigneesName = `${assigneesEmployees.firstname} ${assigneesEmployees.lastname}`;

            console.log(`\n`, "Assign Email", assigneesEmail, `\n`);
            await sendEmail(
              assigneesEmail,
              `1st Notification for ${licences.licence_name} Expires`,
              templates.LicenseFirstNotice(assigneesName, `${licences.licence_name}`)
            );
          } catch (e) {
            throw new Error("Email failed to send");
          }
        }

        //* If detected Days = -2, update
        //* second_notication to 1 then sendEmail
        if (daysLeft == -2 && licenseIDSecondNotification == 0) {
          try {
            await PLC.Licences.update(
              {
                second_notification: 1,
                expires_at: null,
              },
              { where: { licence_id: licences.licence_id } }
            );

            const assigneesName = `${assigneesEmployees.firstname} ${assigneesEmployees.lastname}`;

            console.log(`\n`, "Assign Email", assigneesEmail, `\n`);
            await sendEmail(
              assigneesEmail,
              `2nd Notification for ${licences.licence_name} Expired`,
              templates.LicenseSecondNotice(assigneesName, `${licences.licence_name}`)
            );
          } catch (e) {
            throw new Error("Email failed to send");
          }
        }
      }
    }
  }
});

// If no expired date, it would make the days_left and days_left_pct to 0
schedule.scheduleJob("5 * * * * *", async (where) => {
  const getLicencesInformation = await PLC.Licences.findAll({
    where: {},
  });

  for (const licences of getLicencesInformation) {
    //* Get the Data from the Table Licenses
    const expires = licences.expires_at;

    //* Update everyday in the days_left and days_left_percentage
    //* In each of the licenese rows

    if (expires == null) {
      await PLC.Licences.update(
        {
          days_left: 0,
          days_left_pct: 0,
        },
        { where: { licence_id: licences.licence_id } }
      );
    }
  }
});
