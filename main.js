require("dotenv").config();
const { Telegraf, Markup, session } = require("telegraf");
const { MongoClient } = require("mongodb");
const downloadWordFile = require("./utils/downloadWordFile.js");
const parseWordFile = require("./utils/parseWordFile.js");

const client = new MongoClient(
    process.env.MONGODB_URI
);
client.connect();
const db = client.db('ai-detection-bot');

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session({ db, collectionName: 'sessions' }));

bot.start((ctx) => {

    ctx.reply(
        'Welcome to AI-detection bot. Our bot will help you to see if your text will be detected by Turnitin. ' +
        "Since you are a new user, you will be given 3 free trials to test our service. Good luck!",
        Markup.inlineKeyboard([
            Markup.button.callback("View Pricing", "pricing")
        ])
    );
});

bot.command("detectai", (ctx) => {
    ctx.reply("Submit your word file");
});

bot.command("creditsleft", (ctx) => {
    ctx.reply("You have 88 credits left");
})

bot.action('pricing', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply(
        'AI Detector - $12.99 per month. This includes the following:\n\n' +
        '- 100 credits (~ 25,000 words)\n' +
        '- 99% accuracy\n' +
        '- Detection of AI models such as ChatGPT, Gemini and Claude\n' +
        '- Can be used by two accounts',
        Markup.inlineKeyboard([
            Markup.button.url("Contact Admin", "https://t.me/one_problem_solution_2")
        ])
    );
});

bot.on("document", async (ctx) => {

    const file = ctx.message.document;

    try {

        const fileID = file.file_id;
        const fileURL = await ctx.telegram.getFileLink(fileID);

        await downloadWordFile(fileURL, file);
        const fileContents = await parseWordFile(file.file_name);

        console.log(fileContents);

        ctx.reply("Your file has been parsed successfully!");

    } catch (error) {

        console.log(error);

    }

});

bot.launch();
