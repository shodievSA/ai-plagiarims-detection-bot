const { getNumberOfFreeTrialsLeft } = require("../../services/dbServices.js");

async function displayUserFreeTrialInfo(ctx) {

    const freeTrialsLeft = await getNumberOfFreeTrialsLeft(ctx.from.id);

    if (freeTrialsLeft > 0) {
        ctx.reply(`You have ${freeTrialsLeft} free trials left.`);
    } else {
        ctx.replyWithHTML(
            "You don't have any free trials left.\n\nYou can buy a " +
            "1-month subscription (20,000 UZS) by clicking \"<b>Buy subscription</b>\" " +
            "button."
        );
    }

};

module.exports = displayUserFreeTrialInfo;