const {getUsers} = require("../../services/dbServices");

async function usersCommandHandler(ctx) {
    if (ctx.from.id === 957481488 || ctx.from.id === 860313485 || ctx.from.id === 5311270487) {
        const users = await getUsers();
        const keyboard = users.map((user) => [
            {
                text: `${user.id}`,
                callback_data: `user_${user.id}`,
            },
        ]);

        let text = "";
        users.forEach((user) => {
            text += `${user.id} - \`${user.telegramId}\` ${user.firstName} ${user.lastName} ${user.isSubscriptionActive} ${user.freeTrialCounter}\n\n`;
            console.log(user);
        });

        ctx.reply(text, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: keyboard,
            },
        });
    }

}


module.exports = usersCommandHandler;