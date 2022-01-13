// 12am update everythings
// - Check and compare the days and update in the system
// - System should automatically notify the last approver to review the SWOT 11 months after approval

//* Need to test whether it reduct the one day when date is change

//* Question
//* Is it better to keep on checking the database, like 0 -1 -2 -3 ...
//* If not need to add in columns, like send_email = 1 or 0

//* 4.1 SWOT

const {
  Employees,
  Documents: { SWOT },
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

schedule.scheduleJob("* * * * *", async (where) => {
  const sentNotifications = await SWOT.Forms.findAll({
    where: { status: "active" },
  });

  for (const document of sentNotifications) {
    const usersApprover = document.approved_by;
    const Due = document.due_at;
    const now = new Date();
    const result = differenceInCalendarDays(new Date(Due), new Date(now));

    const GetEmployeesInfo = await Employees.findAll({
      where: { employee_id: usersApprover },
    });

    for (const employeesInfo of GetEmployeesInfo) {
      const approverEmail = employeesInfo.email;

      //330 = 11 months
      try {
        //* later change to 0
        if (result === 329) {
          console.log(`\n email is `, approverEmail, `\n`);
          const name = `${employeesInfo.firstname} ${employeesInfo.lastname}`;
          await sendEmail(
            approverEmail,
            "Update Needed for SWOT",
            templates.updateSwotNotice(name)
          );
        }
      } catch (e) {
        throw new Error("Email failed to send");
      }
    }
  }
});
