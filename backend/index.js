// command line options
const argv = require('yargs-parser')(process.argv.slice(2));

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const db = require('./src/config/connection');
const config = require('./src/config/config');
const mainRouter = require('./src/routes/main.routes');

// notification job schedules
const schedulesforSwot = require('./src/schedules/swots');
const schedulesforEMP = require('./src/schedules/equipmentMaintenance');
const schedulesForPLC = require('./src/schedules/licences');

const app = express();
const PORT = config.port || 8000;

app.use(cors(config.cors));
app.use(cookieParser(config.cookie.secret));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', mainRouter);

// use "npm run reset" to reset database (drop tables + seeding)

(async function main() {
    try {
        // check database credentials
        await db.authenticate();
        console.log('SUCCESSFULLY CONNECTED TO DATABASE');

        // sync models to db
        await db.sync({ force: argv.drop });
        console.log('SUCCESSFULLY SYNCED DB');

        // seeding data
        if (argv.seed) {
            console.log('LOADING SEEDER');
            const seeder = require('./src/database/seeder');

            console.log('RUNNING SEEDER');
            await seeder();

            console.log('FINISHED SEEDING');
        }

        app.listen(PORT, () => {
            console.log(`LISTENING TO PORT ${PORT}`);
        });

        console.log('RUNNING ALL SCHEDULES');
        schedulesforSwot();
        schedulesforEMP();
        schedulesForPLC();
    }
    catch (error) {
        console.log('FAIL TO START SERVER', error);
        process.exit(1);
    }
})();

// https://nodejs.org/api/process.html#process_event_uncaughtexception
// https://stackoverflow.com/a/40867663
// used for cleaning up the application and then shut down
process.on('uncaughtException', (error, origin) => {
    console.log(`AN UNCAUGHT ERROR OCCURED AT ${origin}`);
    console.log('THE ERROR', error);
    process.exit(1);
});
