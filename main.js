require("dotenv").config();
const {Telegraf, Markup, session} = require("telegraf");
const downloadWordFile = require("./utils/downloadWordFile.js");
const parseFile = require("./utils/parseFile.js");
const {
    createUser,
    activateSubscriptionForSingleUser,
    isFreeTrialActive,
    decreaseFreeTrialCounterForSingleUser
} = require("./utils/db/utils");
const {ValidationError} = require("sequelize");


const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
    const user = ctx.from;
    console.log(user)
    const data = {
        telegramId: user.id,
        firstName: user.first_name,
        lastName: user.last_name || "",
        username: user.username || "",
    };

    try {
        await createUser(data);

        ctx.replyWithHTML(
            'Welcome to <b>AI-detection bot</b>!\n\nOur bot will help you to test if your work will be detected by Turnitin. ' +
            "Since you are a new member, you have <b>3 free trials</b>.\n\nTo start using the bot, " +
            "simply send your <b>word</b>, <b>pdf</b> or <b>txt</b> file and we'll take care of the rest.",
            Markup.keyboard([
                ["Check my work"],
                ["My subscription", "My free trials"],
                ["Buy subscription"]
            ])
                .resize()
        );
    } catch (err) {
        ctx.reply("An unexpected error occurred. Please try again later.");

        if (err instanceof ValidationError) {
            console.log("Validation error:", err.errors);
        } else {
            console.error("An error occurred:", err);
        }
    }
});

bot.hears("Buy subscription", (ctx) => {

    ctx.replyWithInvoice({
        title: "AI & Plagiarism detection",
        description:
            "AI & Plagiarism Detection: 1-month subscription with 99% accuracy, " +
            "capable of detecting AI models (e.g., ChatGPT, Gemini, Claude) and " +
            "plagiarism.",
        currency: "UZS",
        prices: JSON.stringify([{label: "Price", amount: 3000000}]),
        provider_token: "398062629:TEST:999999999_F91D8F69C042267444B74CC0B3C747757EB0E065",
        payload: "ai-and-plagiarism-detection"
    });

});

bot.hears("Check my work", (ctx) => {

    ctx.reply("Send your pdf, word or txt file.");

});

bot.hears("My subscription", (ctx) => {

    ctx.reply("You clicked on the 'My subscription' button");

});

bot.hears("My free trials", (ctx) => {

    ctx.reply("You clicked on the 'My free trials' button");

});

bot.on("successful_payment", async (ctx) => {
    const user = ctx.from;
    const telegramId = user.id;
    const payment = ctx.message.successful_payment;
    await activateSubscriptionForSingleUser(telegramId)
    console.log(payment);

});

bot.on("document", async (ctx) => {
    const user = ctx.from;
    const telegramId = user.id;

    const isFreeTrial = await isFreeTrialActive(telegramId)
    if (!isFreeTrial) {
        await ctx.reply("Your free trial is over! if our bot was useful for you, you can buy a monthly subscription.")
        return
    }

    const file = ctx.message.document;
    const fileType = file.mime_type;

    if (
        fileType == "application/pdf"
        ||
        fileType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ||
        fileType == "text/plain"
    ) {
        let isCheckfinished = false;

        let message = "Checking your work.";
        const replyMessage = await ctx.reply(
            message,
            {reply_to_message_id: ctx.message.message_id}
        );
        const messageID = replyMessage.message_id;

        try {

            async function processFile() {

                setTimeout(async () => {

                    const fileID = file.file_id;
                    const fileURL = await ctx.telegram.getFileLink(fileID);

                    await downloadWordFile({
                        fileURL: fileURL,
                        file: file,
                        fileType: fileType
                    });

                    const fileContents = await parseFile({
                        fileName: file.file_name,
                        fileType: fileType
                    });

                    isCheckfinished = true;

                    ctx.reply("Your file has been parsed successfully!");
                    await decreaseFreeTrialCounterForSingleUser(telegramId)
                }, 3000);

            };
            processFile();

            const intervalID = setInterval(() => {

                if (isCheckfinished) {
                    ctx.telegram.deleteMessage(
                        ctx.chat.id,
                        messageID
                    );

                    clearInterval(intervalID);
                } else {
                    if (message === "Checking your work.") {
                        message = "Checking your work..";
                    } else if (message === "Checking your work..") {
                        message = "Checking your work...";
                    } else if (message === "Checking your work...") {
                        message = "Checking your work.";
                    }

                    ctx.telegram.editMessageText(
                        ctx.chat.id,
                        messageID,
                        undefined,
                        message
                    )
                        .catch((error) => {
                            console.log(`Failed to edit message: ${error.message}`);
                        });
                }

            }, 400);

        } catch (error) {
            console.log(error);
        }

    } else {
        ctx.reply(
            "Sorry, our bot doesn't support the file you have submitted. Currently, " +
            "only the following files are supported: pdf, txt and docx."
        );
    }

});

bot.launch();
