const {getUser, UserDoesNotExist, deactivateSubscriptionForSingleUser} = require('../../services/dbServices')

const subscriptionMiddleware = async (ctx, next) => {
    const user = ctx.from
    const telegramId = user.id
    try {
        const dbUser = await getUser(telegramId);
        if (!dbUser.subscriptionFinishedAt) {
            return next();
        }
        const subscriptionFinishedAt = new Date(dbUser.subscriptionFinishedAt);
        const currentDateTime = new Date();
        if (currentDateTime > subscriptionFinishedAt) {
            await deactivateSubscriptionForSingleUser(telegramId);
        }
        return next();
    } catch (err) {
        if (err instanceof UserDoesNotExist) {
            console.log("User doesn't exist (subscriptionMiddleware).");
        } else {
            console.log("Something went wrong.", err);
        }
        return next();
    }

}

module.exports = subscriptionMiddleware