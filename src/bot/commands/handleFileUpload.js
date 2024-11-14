const downloadFile = require("../../utils/downloadFile.js");
const parseFile = require("../../utils/parseFile.js");
const { 
    isFreeTrialActive,
    decreaseFreeTrialCounterForSingleUser
} = require("../../services/dbServices.js");

async function handleFileUpload(ctx) {

    const telegramId = ctx.from.id;
    const isFreeTrial = await isFreeTrialActive(telegramId);

    if (!isFreeTrial) {
        await ctx.reply(
            "Your free trial is over! if our bot was useful " +
            "for you, you can buy a monthly subscription."
        )
        return
    }

    const file = ctx.message.document;
    const fileType = file.mime_type;

    if (
        fileType == "application/pdf"
        ||
        fileType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ||
        fileType == "text/plain"
    ) {
        let isCheckfinished = false;

        let message = "Checking your work.";
        const replyMessage = await ctx.reply(
            message,
            {reply_to_message_id: ctx.message.message_id}
        );
        const messageID = replyMessage.message_id;

        try {

            async function processFile() {

                setTimeout(async () => {

                    const fileID = file.file_id;
                    const fileURL = await ctx.telegram.getFileLink(fileID);

                    await downloadFile({
                        fileURL: fileURL,
                        file: file,
                        fileType: fileType
                    });

                    const fileContents = await parseFile({
                        fileName: file.file_name,
                        fileType: fileType
                    });

                    isCheckfinished = true;

                    ctx.reply("Your file has been parsed successfully!");
                    await decreaseFreeTrialCounterForSingleUser(telegramId);

                }, 3000);

            };
            processFile();

            const intervalID = setInterval(() => {

                if (isCheckfinished) {

                    ctx.telegram.deleteMessage(
                        ctx.chat.id,
                        messageID
                    );

                    clearInterval(intervalID);

                } else {

                    if (message === "Checking your work.") {
                        message = "Checking your work..";
                    } else if (message === "Checking your work..") {
                        message = "Checking your work...";
                    } else if (message === "Checking your work...") {
                        message = "Checking your work.";
                    }

                    ctx.telegram.editMessageText(
                        ctx.chat.id,
                        messageID,
                        undefined,
                        message
                    )
                    .catch((error) => {
                        console.log(`Failed to edit message: ${error.message}`);
                    });

                }

            }, 400);

        } catch (error) {
            console.log(error);
        }

    } else {
        ctx.reply(
            "Sorry, our bot doesn't support the file you have submitted. Currently, " +
            "only the following files are supported: pdf, txt and docx."
        );
    }

};

module.exports = handleFileUpload;