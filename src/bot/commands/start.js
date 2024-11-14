const { Markup } = require("telegraf");
const { createUser } = require("../../services/dbServices.js");
const {ValidationError} = require("sequelize");

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

};

module.exports = startBot;