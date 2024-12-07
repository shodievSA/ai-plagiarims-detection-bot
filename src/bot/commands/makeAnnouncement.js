async function makeAnnouncement(ctx) {

    const userID = ctx.from.id;

    if (
        userID === 957481488 
        || 
        userID === 860313485 
        || 
        userID === 5311270487
    ) {

        ctx.reply(
            "Send your announcement message:",
            {
                reply_markup: {
                    force_reply: true,
                    input_field_placeholder: "Announcement"
                }
            }
        );

    }

}

module.exports = makeAnnouncement;