const logger = require('../../utils/logger')

module.exports = async (ctx, next) => {
    if (ctx.message) {
        logger.log(`Message received: ${ctx.message.text}`);
    }

    if (ctx.callbackQuery) {
        logger.log(`Callback query received: ${ctx.callbackQuery.data}`);
    }

    logger.log(`User info: ${ctx.from.username} (ID: ${ctx.from.id})`);

    await next();
};
