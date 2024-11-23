const {Telegraf} = require("telegraf");
const express = require("express")
const authMiddleware = require("./middlewares/authMiddleware");
const loggerMiddleware = require("./middlewares/loggerMiddleware");
const startBot = require("./commands/start.js");
const checkUserFile = require("./commands/checkUserFile.js");
const displayUserSubscriptionInfo = require("./commands/displayUserSubscriptionInfo.js");
const displayUserFreeTrialInfo = require("./commands/displayUserFreeTrialInfo.js");
const buySubscription = require("./commands/buySubscription.js");
const handleFileUpload = require("./commands/handleFileUpload.js");
const confirmUserPayment = require("./commands/confirmUserPayment.js");
const { decreaseFreeTrialCounterForSingleUser } = require("../services/dbServices.js");
const subscriptionMiddleware = require("./middlewares/subscriptionMiddleware");

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(loggerMiddleware);
bot.use(authMiddleware);
bot.use(subscriptionMiddleware)

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

bot.start(startBot);

bot.hears("📃 Check my work", checkUserFile);
bot.hears("🗓 My subscription", displayUserSubscriptionInfo);
bot.hears("🆓 My free trials", displayUserFreeTrialInfo);
bot.hears("💳 Buy subscription", buySubscription);

bot.on("document", handleFileUpload);
bot.on("successful_payment", confirmUserPayment);

app.post('/webhook/copyleaks/status', (req, res) => {

    console.log('Copyleaks status update:', req.body);
    res.sendStatus(200);

});

app.post('/webhook/copyleaks/completed', async (req, res) => {

    const { results, developerPayload } = req.body;
    const { chat_id, telegram_id } = JSON.parse(developerPayload);
    
    try {

        const reportUrl = results && results.internet[0].url;
        await decreaseFreeTrialCounterForSingleUser(telegram_id);

        bot.telegram.sendMessage(chat_id, reportUrl);

    } catch (error) {

        bot.telegram.sendMessage(
            chat_id, 
            "An error occured while processing your document. " +
            "Please try again later."
        );

    }

    res.sendStatus(200);

});

app.post('/webhook/copyleaks/error', (req, res) => {

    console.log('Copyleaks status update:', req.body);
    res.sendStatus(200);

});

app.use(bot.webhookCallback("/webhook"));
app.listen(3000, async () => {

    try {

        await bot.telegram.setWebhook(
            process.env.WEBHOOK_URL
        );

    } catch (err) {

        console.log(
            "Error occured setting up a webhook: " + err
        );

    }

})

module.exports = bot;
