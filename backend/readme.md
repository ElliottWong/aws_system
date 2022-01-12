# Environment

**USE NODE v16+ FOR BACKEND**

This is required for some newer features, such as [`Array.at()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at#browser_compatibility).

I recommend using something like `nvm`.

- [Windows](https://github.com/coreybutler/nvm-windows/releases) - Download and use the installer (Assets > nvm-setup.zip)
- [POSIX](https://github.com/nvm-sh/nvm) - Run the install script and restart your computer

Then use the command to install the latest version of NodeJS 16:

```
nvm install 16
```

# Setup

Create a `.env` file and put this inside. Remember to make any necessary changes.

```
PORT=8000

DB_HOST=localhost
DB_NAME=ades_eiso
DB_PORT=3306
DB_USER=root
DB_PASSWORD=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_BASE_FOLDER_PATH=eISO

NODEMAILER_HOSTNAME=
NODEMAILER_PORT=
NODEMAILER_DOMAIN=
NODEMAILER_USERNAME=
NODEMIALER_PASSWORD=

AWS_ACCESS_KEY_ID = 
AWS_SECRET_ACCESS_KEY = 
AWS_DEFAULT_REGION = us-east-2
MAIN_EMAIL = eISO <example@gmail.com>
AWS_VERIFY_EMAIL = example@gmail.com
AWS_DELETE_VERIFY_EMAIL = example@gmail.com

JWT_SECRET=superSecretJwtKey
COOKIE_SECRET=bestSecureCodingPractices
```

# Date and Time

Previously, the built-in Date class was sufficient for working with date/time, but now we have to actually manipulate date/time, which gets more difficult. I have choose to use `date-fns` library which is a really simple, functional approach to working with date/time.

It is a library that provides a lot of functions that can do many things. It simply takes in a Date object instance and whatever necessary arguements and returns a result.

Unlike libraries such as Moment (which itself recommends using something else for new projects) that uses method chaining which can be quite confusing in my opinion.

# Shortcut for settine up email for AWS SES

Because SES is a sandbox now, which is why it needed to have to identifty emails, after the eISO webiste is publish, it would not needed to identifty email.

For now, I shall include the instruction on setting the vertify emails in a shortcut ways

```
AWS_ACCESS_KEY_ID = 
AWS_SECRET_ACCESS_KEY = 
AWS_DEFAULT_REGION = us-east-2

MAIN_EMAIL = eISO <example@gmail.com>
// Once setup an vertify email, change the example@gmail.com to your verified email

AWS_VERIFY_EMAIL  = example@gmail.com
// enter the vertify email, you want to add in
```

1. Once you have setup the env, confirm that AWS_VERIFY_EMAIL have a email then go to the terminal and enter 
```
node ses_verifyemailidentify.js
```

2. Go to your email inbox and click on the link in the email

3. To check that your email have been added, go to the terminal and enter
```
node ses_listverifyemail.js
```

4. Now you have checked, go to the MAIN_EMAIL and enter the verified email after that done go to the inviation and send it to yourself, for the ses to work, all email that to send must be identifty first

## To delete Verified or Vertify Email

```
AWS_DELETE_VERIFY_EMAIL = example@gmail.com
// enter the vertify email, you want to remove it
```

After entering, go to the terminal and enter 
```
node ses_deleteverifyemail.js
```

# Project Structure

A rough summary:

```
backend
|_ index.js - entry file
|_ .eslintrc.json - all the annoying syntax issues
|                   you get are from here
|_ docs - random crap
|_ logs - folder of log files
|_ src
   |_ config - config values, 
   |           database connectors and
   |           enums used across the application
   |_ controllers - request handlers
   |_ database - database init and 
   |             development seeder
   |_ errors - application error classes
   |_ jobs - scheduled tasks with node-cron
   |_ middlewares
   |_ models - abstraction of sequelize model methods
   |           for features of each clause
   |_ routes
   |_ schemas - the actual sequelize models
   |_ services - abstraction of features
   |             typically of a third party
   |_ utils - common utility functions or
   |          other library abstractions
   |_ validations - yup schemas
```

Not sure if these definitions are correct, but this is also quite an opionated topic.
