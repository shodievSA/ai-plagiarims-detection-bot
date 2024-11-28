require("dotenv").config({path: require("path").resolve(__dirname, "../../.env")});
const path = require('path');
const fs = require('fs');
const {Telegraf} = require("telegraf");
const express = require("express")
const authMiddleware = require("./middlewares/authMiddleware");
const loggerMiddleware = require("./middlewares/loggerMiddleware");
const startBot = require("./commands/start.js");
const checkUserFile = require("./commands/checkUserFile.js");
const buySubscription = require("./commands/buySubscription.js");
const handleFileUpload = require("./commands/handleFileUpload.js");
const confirmUserPayment = require("./commands/confirmUserPayment.js");
const {decreaseFreeTrialCounterForSingleUser} = require("../services/dbServices.js");
const subscriptionMiddleware = require("./middlewares/subscriptionMiddleware");
const copyleaks = require("../services/copyleaks.js");
const {CopyleaksExportModel} = require("plagiarism-checker");
const usersCommandHandler = require("./commands/usersCommandHandler");
const {getUserById, activateSubscriptionForSingleUser} = require("../services/dbServices");
const displayUserProfileInfo = require("./commands/displayUserProfileInfo");
const reportError = require("./errorsBot.js");

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

bot.hears("📄 Check my work", checkUserFile);
bot.hears("💳 Buy subscription", buySubscription);
bot.hears("🧑‍💻 My profile", displayUserProfileInfo);

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

    const {scannedDocument, developerPayload, results} = req.body;
    const {chat_id, telegram_id, token} = JSON.parse(developerPayload);

    const scanID = scannedDocument["scanId"];
    let references = [];

    if (results.internet.length > 0) {

        for (let i = 0; i < results.internet.length; i++) {

            references.push({
                id: results.internet[i].id,
                endpoint: `${process.env.WEBHOOK_URL}/export/${scanID}/result/${results.internet[i].id}`,
                verb: "POST"
            });

        }

    }

    const exportModel = new CopyleaksExportModel(
        `${process.env.WEBHOOK_URL}/export/scanId/${scanID}/completion`,
        references,
        undefined,
        undefined,
        JSON.stringify({
            chat_id,
            telegram_id,
        }),
        {
            endpoint: `${process.env.WEBHOOK_URL}/export/${scanID}/pdf-version/${chat_id}/${telegram_id}`,
            verb: "POST"
        },
    );

    copyleaks.exportAsync(
        token, scanID, scanID, exportModel
    )
    .then((res) => {

        console.log(res);

    })
    .catch(async (err) => {

        console.log(
            "The following error occured while sending export model: " + err
        );

        await reportError(
            chat_id,
            `Error:\n\n"Couldn't export PDF report of a user."`
        );

        await bot.telegram.sendMessage(
            chat_id,
            "Sorry, we couldn't scan your file. 😓\n\n" +
            "We've been already informed about your issue and we'll try to fix it as soon as possible. " +
            "We advise you to resend your file in 2 hours.\n\n" +
            "We are sorry for the inconvenience our service might have caused."
        );

    });

    res.sendStatus(200);

});

app.post('/webhook/export/:scanID/result/:resultID', async (req, res) => {

    console.log("Result webhook triggered!");

    res.sendStatus(200);

})

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

        try {

            fs.writeFileSync(filePath, req.body, async (error) => {

                if (err) {
                    console.error('Error saving file:', error);
                    
                    await reportError(
                        chatID,
                        `Error:\n\n"The user's PDF report couldn't be saved in the file system."`
                    );
    
                    await bot.telegram.sendMessage(
                        chatID,
                        "Sorry, we couldn't scan your file. 😓\n\n" +
                        "We've been already informed about your issue and we'll try to fix it as soon as possible. " +
                        "We advise you to resend your file in 2 hours.\n\n" +
                        "We are sorry for the inconvenience our service might have caused."
                    );
                }
    
            });

        } catch (error) {

            console.error('Error saving file:', error);
                    
            await reportError(
                chatID,
                `Error:\n\n"Couldn't parse the request body of PDF report API endpoint."`
            );

            await bot.telegram.sendMessage(
                chatID,
                "Sorry, we couldn't scan your file. 😓\n\n" +
                "We've been already informed about your issue and we'll try to fix it as soon as possible. " +
                "We advise you to resend your file in 2 hours.\n\n" +
                "We are sorry for the inconvenience our service might have caused."
            );

        }

        res.sendStatus(200);

        await bot.telegram.sendDocument(
            chatID, {source: filePath}
        );

        await decreaseFreeTrialCounterForSingleUser(telegramID);

        fs.unlinkSync(filePath);

    }
);

app.post('/webhook/copyleaks/error', async (req, res) => {

    let { developerPayload, error } = req.body;
    developerPayload = JSON.parse(developerPayload);

    await reportError(
        developerPayload['chat_id'],
        `Code: ${error.code}\n\n` +
        `Error:\n\n"${error.message}"`
    );

    await bot.telegram.deleteMessage(
        developerPayload['chat_id'],
        developerPayload['messageID']
    );

    await bot.telegram.sendMessage(
        developerPayload['chat_id'],
        "Sorry, we couldn't scan your file. 😓\n\n" +
        "We've been already informed about your issue and we'll try to fix it as soon as possible. " +
        "We advise you to resend your file in 2 hours.\n\n" +
        "We are sorry for the inconvenience our service might have caused."
    );

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
