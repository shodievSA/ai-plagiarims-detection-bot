require("dotenv").config();
const copyleaks = require("../../services/copyleaks.js")

async function getAvailableCredits(ctx) {

    const userID = ctx.from.id;

    if (
        userID === 957481488 
        || 
        userID === 860313485 
        || 
        userID === 5311270487
    ) {

        copyleaks.loginAsync(
            process.env.COPYLEAKS_EMAIL,
            process.env.COPYLEAKS_API_KEY
        )
        .then((loginResult) => {

            copyleaks.getCreditsBalanceAsync(loginResult)
            .then((res) => {

                ctx.replyWithHTML(
                    `Credits left: <b>${res.Amount}</b>`
                );

            })
            .catch((err) => {

                console.log(err);

                ctx.reply(
                    "Couldn't get the credits."
                );

            })

        })
        .catch((err) => {

            console.log(err);

            ctx.reply(
                "Couldn't log in."
            );

        });

    }

}

module.exports = getAvailableCredits;