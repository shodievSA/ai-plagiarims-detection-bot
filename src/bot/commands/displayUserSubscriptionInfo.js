const { checkUserSubscription } = require("../../services/dbServices.js");

async function displayUserSubscriptionInfo(ctx) {

    const isUserSubscriptionActive = await checkUserSubscription(ctx.from.id);

    if (isUserSubscriptionActive) {

    } else {
        ctx.reply("You don't have any active subscriptions at the moment.");
    }

};

module.exports = displayUserSubscriptionInfo;