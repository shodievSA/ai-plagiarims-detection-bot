const {Telegraf} = require("telegraf");
const authMiddleware = require("./middlewares/authMiddleware");
const loggerMiddleware = require("./middlewares/loggerMiddleware");
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(loggerMiddleware)
bot.use(authMiddleware);

module.exports = bot;
