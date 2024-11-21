const {Telegraf} = require("telegraf");
const authMiddleware = require("./middlewares/authMiddleware");
const loggerMiddleware = require("./middlewares/loggerMiddleware");
const startBot = require("./commands/start.js");
const checkUserFile = require("./commands/checkUserFile.js");
const displayUserSubscriptionInfo = require("./commands/displayUserSubscriptionInfo.js");
const displayUserFreeTrialInfo = require("./commands/displayUserFreeTrialInfo.js");
const buySubscription = require("./commands/buySubscription.js");
const handleFileUpload = require("./commands/handleFileUpload.js");
const confirmUserPayment = require("./commands/confirmUserPayment.js");
const subscriptionMiddleware = require("./middlewares/subscriptionMiddleware");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(loggerMiddleware);
bot.use(authMiddleware);
bot.use(subscriptionMiddleware)

bot.start(startBot);

bot.hears("Check my work", checkUserFile);
bot.hears("My subscription", displayUserSubscriptionInfo);
bot.hears("My free trials", displayUserFreeTrialInfo);
bot.hears("Buy subscription", buySubscription);

bot.on("document", handleFileUpload);
bot.on("successful_payment", confirmUserPayment);

module.exports = bot;
