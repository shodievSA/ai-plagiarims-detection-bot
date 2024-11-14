const {User} = require('../../db/models/user');
const {ValidationError} = require('sequelize');
const {UserDoesNotExist} = require("./exceptions");

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
    }catch (err) {
        if (err instanceof UserDoesNotExist) {
            return false;
        }
        else {
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


async function isFreeTrialActive(telegramId) {
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

module.exports = {
    createUser,
    activateSubscriptionForSingleUser,
    deactivateSubscriptionForSingleUser,
    isFreeTrialActive,
    decreaseFreeTrialCounterForSingleUser
};