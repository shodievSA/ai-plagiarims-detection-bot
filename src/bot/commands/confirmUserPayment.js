const { 
    activateSubscriptionForSingleUser 
} = require("../../services/dbServices.js");

async function confirmUserPayment(ctx) {

    const telegramId = ctx.from.id;
    const payment = ctx.message.successful_payment;

    await activateSubscriptionForSingleUser(telegramId);
    
    console.log(payment);

};

module.exports = confirmUserPayment;