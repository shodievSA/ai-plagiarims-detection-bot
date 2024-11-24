module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Work", {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        fileLink: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fileUniqueName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fileName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fileType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fileId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fileUniqueId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fileSize: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    });
};
