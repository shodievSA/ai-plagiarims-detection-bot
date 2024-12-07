const { Markup } = require("telegraf");

async function handleMessage(ctx) {

    const isUserMessageReply = ctx.update.message?.reply_to_message?.text;

    if (
        isUserMessageReply 
        && 
        isUserMessageReply == "Send your announcement message:"
    ) {

        ctx.reply(
            `Are you sure you want to send the following ` +
            `announcement to every user?\n\n"${ctx.update.message.text}"`,
            Markup.inlineKeyboard([
                [
                    Markup.button.callback("Yes", "send_announcement_true"),
                    Markup.button.callback("No", "send_announcement_false")
                ]
            ])
        );

    }

}

module.exports = handleMessage;