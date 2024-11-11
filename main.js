require("dotenv").config();
const { Telegraf, Markup, session } = require("telegraf");
const { MongoClient } = require("mongodb");
const downloadWordFile = require("./utils/downloadWordFile.js");
const parseFile = require("./utils/parseFile.js");

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
    const fileType = file.mime_type;

    if (
        fileType == "application/pdf"
        ||
        fileType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ||
        fileType == "text/plain"
    ) {
        try {

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
    
            console.log(fileContents);
    
            ctx.reply("Your file has been parsed successfully!");
    
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
