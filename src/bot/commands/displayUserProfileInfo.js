const {getUser} = require("../../services/dbServices");
const {formatDateTime} = require("../../utils/formatDate");


async function displayUserProfileInfo(ctx) {
    const user = ctx.from;

    const dbUser = await getUser(user.id);
    const subscriptionStartedAt = new Date(dbUser.subscriptionStartedAt);
    const subscriptionFinishedAt = new Date(dbUser.subscriptionFinishedAt);
    const formattedSubscriptionStartedAt = await formatDateTime(subscriptionStartedAt);
    const formattedSubscriptionFinishedAt = await formatDateTime(subscriptionFinishedAt);

    const text = !dbUser.isSubscriptionActive ? `Profile info:\n\n<pre>ID: ${dbUser.id}</pre>\nFree trials left: <strong>${dbUser.freeTrialCounter}</strong>\n\nIf you have any questions you can contact admin: <strong>@one_problem_solution_2</strong>.` : `Profile info:\n\n<pre>ID: ${dbUser.id}</pre>\nFree trials left: <strong>${dbUser.freeTrialCounter}</strong>\nSubscription activated at: <strong>${formattedSubscriptionStartedAt}</strong>\nSubscription finishes at: <strong>${formattedSubscriptionFinishedAt}</strong>\n\nIf you have any questions you can contact admin: <strong>@one_problem_solution_2</strong>.`
    ctx.reply(text, {parse_mode: "HTML"});

}

module.exports = displayUserProfileInfo;