module.exports = {
    botToken: process.env.BOT_TOKEN,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT,
    dbUrl: `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    apiKey: process.env.COPYLEAKS_API_KEY,
    apiEmail: process.env.COPYLEAKS_EMAIL,
}