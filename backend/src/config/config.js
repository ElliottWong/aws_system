require('dotenv').config();

module.exports = {
    port: process.env.PORT,
    cors: {
    // admin frontend, normal frontend
        origin: ['http://localhost:3001', 'http://localhost:4001'],
        credentials: true,
        optionsSuccessStatus: 204
    },
    frontend: {
        baseUrl: 'http://localhost:4001'
    },
    db: {
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    },
    nodemailer: {
        hostname: process.env.NODEMAILER_HOSTNAME,
        port: process.env.NODEMAILER_PORT,
        domain: process.env.NODEMAILER_DOMAIN,
        username: process.env.NODEMAILER_USERNAME,
        password: process.env.NODEMIALER_PASSWORD
    },
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
        baseFolderPath: process.env.CLOUDINARY_BASE_FOLDER_PATH ?? 'eISO'
    },
    aws: {
        region: process.env.AWS_DEFAULT_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        mainEmail: process.env.MAIN_EMAIL,
        verifyEmail: process.env.AWS_VERIFY_EMAIL,
        deleteVerifyEmail: process.env.AWS_DELETE_VERIFY_EMAIL
    },
    jwt: {
        secret: process.env.JWT_SECRET
    },
    cookie: {
        secret: process.env.COOKIE_SECRET
    }
};
