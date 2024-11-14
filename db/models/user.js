const {DataTypes} = require("sequelize");
const {sequelize} = require("../config");
const User = sequelize.define("User", {
        telegramId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        username: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isSubscriptionActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        subscriptionStartedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        subscriptionFinishedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        freeTrialCounter: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 3,
        }

    }
)

async function initUser() {
    try {
        await sequelize.sync();
        console.log('The User model created successfully.');
    } catch (error) {
        console.error('Something went wrong while migrating: ', error);
    }
}

module.exports = {User, initUser};

