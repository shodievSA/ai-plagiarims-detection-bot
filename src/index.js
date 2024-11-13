require("dotenv").config({path: require("path").resolve(__dirname, "../.env")});

const bot = require("./bot/bot");
bot.launch();
console.log("Bot started successfully!");
