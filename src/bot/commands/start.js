const { Markup } = require("telegraf");
const { createUser } = require("../../services/dbServices.js");
const { ValidationError } = require("sequelize");

async function startBot(ctx) {

    const data = {
        telegramId: ctx.from.id,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name || "",
        username: ctx.from.username || "",
    };

    try {

        await createUser(data);

        ctx.replyWithHTML(
            'Welcome to <b>AI & Plagiarism</b> detection bot!\n\nOur bot will help you to see if your work will be detected by Turnitin. ' +
            "Since you are a new member, you have <b>2 free trials</b>.\n\nTo check your work, " +
            "click \"<b>Check my work</b>\" button and then send your file. At the moment, the following files are supported: " +
            "<b>.pdf</b>, <b>.txt</b>, <b>.docx</b> and <b>.doc</b>.",
            Markup.keyboard([
                ["📄 Check my work",],
                ["🧑‍💻 My profile", "💳 Buy subscription"]
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

};

module.exports = startBot;