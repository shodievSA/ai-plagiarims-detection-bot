const {createUser} = require("../../services/dbServices");

const authMiddleware = async (ctx, next) => {
    const user = ctx.from;
    try {
        const data = {
            telegramId: user.id,
            firstName: user.first_name,
            lastName: user.last_name || "",
            username: user.username || "",
        }
        await createUser(data);
        return next();
    } catch (err) {
        console.log("Something went wrong while creating a user!");
        await ctx.telegram.sendMessage(user.id, "Unexpected error happened, please try again later!")
    }
}


module.exports = authMiddleware