require("dotenv").config({path: require("path").resolve(__dirname, "../../.env")});
const path = require('path');
const fs = require('fs');
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
const {decreaseFreeTrialCounterForSingleUser} = require("../services/dbServices.js");
const subscriptionMiddleware = require("./middlewares/subscriptionMiddleware");
const copyleaks = require("../services/copyleaks.js");
const {CopyleaksExportModel} = require("plagiarism-checker");
const usersCommandHandler = require("./commands/usersCommandHandler");
const {getUsers, getUser, getUserById, activateSubscriptionForSingleUser} = require("../services/dbServices");
const displayUserProfileInfo = require("./commands/displayUserProfileInfo");
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(loggerMiddleware);
bot.use(authMiddleware);
bot.use(subscriptionMiddleware)

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.raw({type: 'application/pdf', limit: "10mb"}));

bot.start(startBot);

bot.hears("/users", usersCommandHandler);

bot.hears("📃 Check my work", checkUserFile);
bot.hears("🗓 My subscription", displayUserSubscriptionInfo);
bot.hears("🆓 My free trials", displayUserFreeTrialInfo);
bot.hears("💳 Buy subscription", buySubscription);
bot.hears("👤 My profile", displayUserProfileInfo);

bot.on("document", handleFileUpload);
bot.on("successful_payment", confirmUserPayment);
bot.on("callback_query", async (ctx) => {
    const callbackData = ctx.callbackQuery.data
    const userId = callbackData.split("_")[1]
    const user = await getUserById(userId);
    await activateSubscriptionForSingleUser(user.telegramId);
    console.log(ctx.callbackQuery.data)
    ctx.reply(`Subscription is activated for user with id ${userId}`)

});


app.post('/webhook/copyleaks/status', (req, res) => {

    console.log('Copyleaks status update:', req.body);
    res.sendStatus(200);

});

app.post('/webhook/copyleaks/completed', async (req, res) => {

    const {scannedDocument, developerPayload} = req.body;
    const {chat_id, telegram_id, token} = JSON.parse(developerPayload);

    const scanID = scannedDocument["scanId"];

    const exportModel = new CopyleaksExportModel(
        `${process.env.WEBHOOK_URL}/export/scanId/${scanID}/completion`,
        [],
        undefined,
        undefined,
        JSON.stringify({
            chat_id,
            telegram_id,
        }),
        {
            endpoint: `${process.env.WEBHOOK_URL}/export/${scanID}/pdf-version/${chat_id}/${telegram_id}`,
            verb: "POST"
        }
    );

    copyleaks.exportAsync(
        token, scanID, scanID, exportModel
    )
        .then((res) => {

            console.log(res);

        })
        .catch((err) => {

            console.log(
                "The following error occured while sending export model: " + err
            );

        });

    res.sendStatus(200);

});

app.post('/webhook/export/scanId/:scanID/completion', async (req, res) => {

    console.log(
        "Completion webhook has been triggered!",
        req.body
    );

    res.sendStatus(200);

});

app.post(
    '/webhook/export/:scanID/pdf-version/:chat_id/:telegram_id',
    async (req, res) => {

        const chatID = Number(req.params['chat_id']);
        const telegramID = Number(req.params['telegram_id']);

        const filePath = path.join(
            __dirname,
            'reports',
            `${chatID}-report.pdf`
        );

        fs.writeFileSync(filePath, req.body, (err) => {

            if (err) {
                console.error('Error saving file:', err);
                return res.status(500).send('Failed to save file.');
            }

        });

        res.sendStatus(200); // not sure if it is put correctly

        await bot.telegram.sendDocument(
            chatID, {source: filePath}
        );

        await decreaseFreeTrialCounterForSingleUser(telegramID);

        fs.unlinkSync(filePath);

    }
);

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
