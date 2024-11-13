module.exports = (sequelize, DataTypes) => {
    return sequelize.define("User", {
        telegramId: {
            type: DataTypes.BIGINT, allowNull: false, unique: true,
        }, firstName: {
            type: DataTypes.STRING, allowNull: false,
        }, lastName: {
            type: DataTypes.STRING, allowNull: false,
        },
        username: {
            type: DataTypes.STRING, allowNull: true,
        }, isSubscriptionActive: {
            type: DataTypes.BOOLEAN, defaultValue: false,
        }, subscriptionStartedAt: {
            type: DataTypes.DATE, allowNull: true, defaultValue: null,
        }, subscriptionFinishedAt: {
            type: DataTypes.DATE, allowNull: true, defaultValue: null,
        }, freeTrialCounter: {
            type: DataTypes.INTEGER, allowNull: false, defaultValue: 3,
        }

    });
};
