const {getUser} = require("../../services/dbServices");
const formatDate = require("../../utils/formatDate.js");


async function displayUserProfileInfo(ctx) {
    const user = ctx.from;

    const dbUser = await getUser(user.id);
    const subscriptionStartedAt = new Date(dbUser.subscriptionStartedAt);
    const subscriptionFinishedAt = new Date(dbUser.subscriptionFinishedAt);
    const formattedSubscriptionStartedAt = formatDate(
        subscriptionStartedAt, "EEEE MMMM do yyyy"
    );
    const formattedSubscriptionFinishedAt = formatDate(
        subscriptionFinishedAt, "EEEE MMMM do yyyy"
    );

    const text = !dbUser.isSubscriptionActive ? (
        `Profile info:\n\n<b>User ID</b>: ${dbUser.id}\n\n` +
        `<b>Free trials left</b>: ${dbUser.freeTrialCounter}` 
    ) : (
        `Profile info:\n\n<b>User ID</b>: ${dbUser.id}\n\n` +
        `<b>Free trials left</b>: ${dbUser.freeTrialCounter}\n\n` +
        `<b>Subscription purchase date</b>: ${formattedSubscriptionStartedAt}\n\n` +
        `<b>Subscription expiration date</b>: ${formattedSubscriptionFinishedAt}`
    )
    
    ctx.reply(text, {parse_mode: "HTML"});

}

module.exports = displayUserProfileInfo;