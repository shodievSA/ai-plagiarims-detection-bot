require("dotenv").config({path: require("path").resolve(__dirname, "../.env")});
const {Sequelize, DataTypes} = require("sequelize");
const {dbUrl} = require("../config/config");
const userModel = require("./models/user");

const sequelize = new Sequelize(dbUrl);

const User = userModel(sequelize, DataTypes);

const models = {
    User,
};

sequelize.sync({force: false})
    .then(() => {
        console.log("Database synced and tables created, if not already existing.");
    })
    .catch((error) => {
        console.error("Error syncing database:", error);
    });


module.exports = {sequelize, ...models};
