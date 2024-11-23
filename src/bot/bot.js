require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
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
const copyleaks = require("../services/copyleaks.js");
const { CopyleaksExportModel } = require("plagiarism-checker");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

const storage  = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./reports");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

app.post('/webhook/copyleaks/status', (req, res) => {

    console.log('Copyleaks status update:', req.body);
    res.sendStatus(200);

});

app.post('/webhook/copyleaks/completed', async (req, res) => {

    const { scannedDocument, developerPayload } = req.body;
    const { chat_id, telegram_id, token } = JSON.parse(developerPayload);

    const scanID = scannedDocument["scanId"];
    const resultID = results["internet"][0]["id"]; // not there

    const exportModel = new CopyleaksExportModel(
        `${process.env.WEBHOOK_URL}/export/scanId/${scanID}/completion`,
        [
            {
                id: resultID,
                endpoint: `${process.env.WEBHOOK_URL}/export/${scanID}/result/${resultID}`,
                verb: "POST",
            },
        ],
        {
            endpoint: `${process.env.WEBHOOK_URL}/export/${scanID}/crawled-version`,
            verb: "POST",
        },
        undefined,
        JSON.stringify({
            chat_id,
            telegram_id
        }),
        {
            endpoint: `${process.env.WEBHOOK_URL}/export/pdf-report`,
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

app.post('/webhook/export/pdf-report', async (req, res) => {

    console.log(
        "Pdf report endpoint:",
        req.file
    )

    res.sendStatus(200);

});

app.post('/webhook/copyleaks/export-completed', async (req, res) => {

    console.log("Export has completed");
    console.log(req.body);

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
