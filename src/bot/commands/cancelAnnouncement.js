async function cancelAnnouncement(ctx) {

    ctx.answerCbQuery();

    const chatID = ctx.update.callback_query.message.chat.id;
    const messageID = ctx.update.callback_query.message.message_id;

    await ctx.telegram.deleteMessage(chatID, messageID);

}

module.exports = cancelAnnouncement;