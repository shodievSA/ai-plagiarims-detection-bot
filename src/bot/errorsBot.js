require("dotenv").config();
const {Telegraf} = require("telegraf");

const errorsBot = new Telegraf(process.env.ERRORS_BOT_TOKEN);

async function reportError(chatID, errorMessage) {

    await errorsBot.telegram.sendMessage(
        -4701494151,
        `Chat ID: ${chatID}\n\n` +
        errorMessage
    );

}

module.exports = reportError;