const { 
    checkUserSubscription,
    getUserSubscriptionDetails
} = require("../../services/dbServices.js");

async function displayUserSubscriptionInfo(ctx) {

    const userTelegramID = ctx.from.id;
    const isUserSubscriptionActive = await checkUserSubscription(
        userTelegramID
    );

    if (isUserSubscriptionActive) {

        const { purchasedOn, expiresOn } = await getUserSubscriptionDetails(
            userTelegramID
        );

        ctx.reply(
            "Your subscription details:\n\n" +
            "<b>Purchased on: </b>" + purchasedOn + "\n" +
            "<b>Expires on: </b>" + expiresOn
        );

    } else {

        ctx.reply(
            "You don't have any active subscriptions at the moment."
        );

    }

};

module.exports = displayUserSubscriptionInfo;