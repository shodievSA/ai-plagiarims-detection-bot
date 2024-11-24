const {readJSON} = require("../../utils/jsonHandlers");
const {handleRenewAccessData} = require("../../services/apiServices");
const logger = require('../../utils/logger')

const apiAuthMiddleware = async (ctx, next) => {
    try {
        const accessData = await readJSON("access.json");
        const expirationDateTime = new Date(accessData[".expires"]);
        const currentDateTime = new Date();

        if (currentDateTime > expirationDateTime) {
            logger.log("Access data is expired. Attempting to renew...");
            await handleRenewAccessData();
        } else {
            logger.log("Access data is still active. Proceeding...");
        }
    } catch (error) {
        logger.log(`Error in reading or processing access.json: ${error.message}`);

        try {
            logger.log("Attempting to renew access data as fallback...");
            await handleRenewAccessData();
        } catch (renewError) {
            logger.log(`Critical error: Unable to renew access data: ${renewError.message}`);
            throw renewError;
        }
    }

    return await next();
};


module.exports = apiAuthMiddleware