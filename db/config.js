require("dotenv").config();
const {Sequelize} = require('sequelize');

const dbName = process.env.DB_NAME;
const dbPassword = process.env.DB_PASSWORD;
const dbPort = process.env.DB_PORT;
const dbTable = process.env.DB_TABLE_NAME;

const sequelize = new Sequelize(`
    postgres://${dbName}:${dbPassword}@localhost:${dbPort}/${dbTable}
`);

module.exports = {sequelize};