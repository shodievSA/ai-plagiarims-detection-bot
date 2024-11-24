const {ValidationError} = require('sequelize');
const {User, Work} = require("../db/index");

class UserDoesNotExist extends Error {
    constructor(message = 'User does not exist.') {
        super(message);
        this.name = 'UserDoesNotExist';
        this.statusCode = 404;
    }
}

async function getUser(telegramId) {
    const user = await User.findOne({
        where: {telegramId}
    });
    if (!user) {
        throw new UserDoesNotExist("User does not exist.")
    }
    return user;
}

async function checkUserExistence(telegramId) {
    try {
        const user = await getUser(telegramId)
        return user !== null;
    } catch (err) {
        if (err instanceof UserDoesNotExist) {
            return false;
        } else {
            return false;
        }
    }

}

async function createUser(data) {
    const userExists = await checkUserExistence(data.telegramId)
    if (userExists) {
        return
    }
    try {
        const user = await User.create({
            telegramId: data.telegramId,
            firstName: data.firstName,
            lastName: data.lastName || "",
            username: data.username || "",
        });
        console.log('User created successfully:', user.toJSON());
    } catch (err) {
        if (err instanceof ValidationError) {
            console.error("Validation error:", err.errors);
            throw new Error("Caught a ValidationError: " + err.message);
        } else {
            console.error("An error occurred:", err);
            throw err;
        }
    }
}

async function updateUserSubscriptionStatus(telegramId, startedAt, finishedAt, isActive) {
    try {
        await User.update({
            isSubscriptionActive: isActive,
            subscriptionStartedAt: startedAt,
            subscriptionFinishedAt: finishedAt

        }, {where: {telegramId: telegramId}});
    } catch (err) {
        if (err instanceof ValidationError) {
            throw new ValidationError("Not enough data has been provided.", err)
        } else {
            throw new Error(`Something went wrong: ${err.message}`)
        }
    }

}

async function activateSubscriptionForSingleUser(telegramId) {
    try {
        const startedAt = new Date();
        const finishedAt = new Date();
        finishedAt.setDate(startedAt.getDate() + 30)
        await updateUserSubscriptionStatus(telegramId, startedAt, finishedAt, true);
    } catch (err) {
        if (err instanceof ValidationError) {
            throw new ValidationError("Not enough data has been provided.", err)
        } else {
            throw new Error(`Something went wrong: ${err.message}`)
        }
    }
}

async function deactivateSubscriptionForSingleUser(telegramId) {
    try {
        await updateUserSubscriptionStatus(telegramId, null, null, false);
    } catch (err) {
        if (err instanceof ValidationError) {
            throw new ValidationError("Not enough data has been provided.", err)
        } else {
            throw new Error(`Something went wrong: ${err.message}`)
        }
    }
}

async function checkUserFreeTrial(telegramId) {
    try {
        const user = await getUser(telegramId);
        return user.freeTrialCounter !== 0;
    } catch (err) {
        throw new Error("Such user does not exist.")
    }
}

async function decreaseFreeTrialCounterForSingleUser(telegramId) {
    try {
        const user = await getUser(telegramId);
        const originalFreeTrialCounter = user.freeTrialCounter;
        const newFreeTrialCounter = Math.max(originalFreeTrialCounter - 1, 0); // Avoid negative counters
        await User.update({freeTrialCounter: newFreeTrialCounter}, {where: {telegramId}});
        console.log(`Free trial counter decreased successfully for user: ${telegramId}`);
    } catch (err) {
        console.error("Something went wrong while decreasing the free trial counter:", err);
    }
}

async function getNumberOfFreeTrialsLeft(telegramId) {
    try {
        const user = await getUser(telegramId);
        const originalFreeTrialCounter = user.freeTrialCounter;

        return originalFreeTrialCounter;
    } catch (err) {
        console.error(
            "Something went wrong while getting number of free trials left for a user: ",
            err
        );
    }
}

async function checkUserSubscription(telegramId) {
    try {
        const user = await getUser(telegramId);
        const isSubscriptionActive = user.isSubscriptionActive;

        return isSubscriptionActive;
    } catch (err) {
        console.error(
            "Something went wrong while checking if user subscription is active: ",
            err
        );
    }
}

async function getUserSubscriptionDetails(telegramId) {

    try {

        const user = await getUser(telegramId);
        const subscriptionInfo = {
            "purchasedOn": user["subscriptionStartedAt"],
            "expiresOn": user["subscriptionFinishedAt"]
        }

        return subscriptionInfo;

    } catch (err) {

        console.error(
            "Something went wrong while obtaining user's subscription details: ",
            err
        );

    }

}


async function createWork(telegramId, documentData) {
    try {
        if (!telegramId || !documentData) {
            throw new Error("Invalid input: 'telegramId' and 'documentData' are required.");
        }

        const refactoredDocumentData = {
            fileLink: documentData.file_link,
            fileUniqueName: documentData.file_unique_name,
            fileName: documentData.file_name || "unknown",
            fileType: documentData.mime_type || "unknown",
            fileId: documentData.file_id,
            fileUniqueId: documentData.file_unique_id,
            fileSize: documentData.file_size || 0
        };

        if (!refactoredDocumentData.fileId || !refactoredDocumentData.fileUniqueId) {
            throw new Error("Invalid document data: Missing essential fields (fileId, fileUniqueId).");
        }

        const user = await getUser(telegramId);
        if (!user) {
            throw new Error(`User with telegramId '${telegramId}' does not exist.`);
        }

        const userId = user.id;
        const work = await Work.create({userId, ...refactoredDocumentData});

        return {success: true, work};
    } catch (error) {
        if (error instanceof UserDoesNotExist) {
            console.error(`User error: ${error.message}`);
        } else {
            console.error(`Unexpected error: ${error.message}`);
        }

        return {success: false, error: error.message};
    }
}

module.exports = {
    getUser,
    createUser,
    activateSubscriptionForSingleUser,
    deactivateSubscriptionForSingleUser,
    checkUserFreeTrial,
    decreaseFreeTrialCounterForSingleUser,
    getNumberOfFreeTrialsLeft,
    checkUserSubscription,
    getUserSubscriptionDetails,
    UserDoesNotExist,
    createWork,
};