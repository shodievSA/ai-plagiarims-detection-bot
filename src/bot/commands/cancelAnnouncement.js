const { Markup } = require("telegraf");

async function cancelAnnouncement(ctx) {

    ctx.answerCbQuery();

    const chatID = ctx.update.callback_query.message.chat.id;
    const messageID = ctx.update.callback_query.message.message_id;

    await ctx.reply(
        "Announcement cancelled",
        Markup.keyboard([
            ["📄 Check my work",],
            ["🧑‍💻 My profile", "💳 Buy subscription"]
        ])
        .resize()
    );
    await ctx.telegram.deleteMessage(chatID, messageID);

}

module.exports = cancelAnnouncement;