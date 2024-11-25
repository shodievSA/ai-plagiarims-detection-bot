const { 
    checkUserSubscription,
    getUserSubscriptionDetails
} = require("../../services/dbServices.js");
const formatDate = require("../../utils/formatDate.js");

async function displayUserSubscriptionInfo(ctx) {

    const userTelegramID = ctx.from.id;
    const isUserSubscriptionActive = await checkUserSubscription(
        userTelegramID
    );

    if (isUserSubscriptionActive) {

        let { purchaseDate, expirationDate } = await getUserSubscriptionDetails(
            userTelegramID
        );

        purchaseDate = formatDate(
            purchaseDate, 
            "EEEE MMMM do yyyy"
        );
        expirationDate = formatDate(
            expirationDate, 
            "EEEE MMMM do yyyy"
        );

        ctx.replyWithHTML(
            "Your subscription details:\n\n" +
            "<b>Purchase date: </b>" + purchaseDate + "\n\n" +
            "<b>Expiration date: </b>" + expirationDate
        );

    } else {

        ctx.reply(
            "You don't have any active subscriptions at the moment."
        );

    }

};

module.exports = displayUserSubscriptionInfo;