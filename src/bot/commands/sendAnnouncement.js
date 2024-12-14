const { Markup } = require("telegraf");
const { getUsers } = require("../../services/dbServices.js");

async function sendAnnouncement(ctx) {

    await ctx.answerCbQuery();
    
    const message = ctx.update.callback_query.message.text;
    
    let announcement = message.split(
        "Are you sure you want to send the following announcement to every user?"
    )[1];
    announcement = announcement.slice(3);
    announcement = announcement.slice(0, -1);

    const users = await getUsers();

    let counter = 0;

    await Promise.all(users.map(async (user, index) => 

        new Promise((resolve) => {

            setTimeout(async () => {

                await ctx.telegram.sendMessage(
                    user.telegramId, announcement
                ); 
                counter++;

                resolve();

            }, index * 1000);

        })

    ));

    await ctx.reply(
        `Announcement has been sent to ${counter} users.`,
        Markup.keyboard([
            ["📄 Check my work",],
            ["🧑‍💻 My profile", "💳 Buy subscription"]
        ])
        .resize()
    );

    const chatID = ctx.update.callback_query.message.chat.id;
    const messageID = ctx.update.callback_query.message.message_id;

    await ctx.telegram.deleteMessage(chatID, messageID);

}

module.exports = sendAnnouncement;