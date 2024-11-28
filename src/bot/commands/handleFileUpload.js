const copyleaks = require("../../services/copyleaks.js");
const { 
    checkUserFreeTrial, 
    checkUserSubscription 
} = require("../../services/dbServices.js");
const { CopyleaksURLSubmissionModel } = require('plagiarism-checker');
const imageBase64 = require("../../utils/imageBase64.js");
const reportError = require("../errorsBot.js");

async function handleFileUpload(ctx) {

    const telegramId = ctx.from.id;

    const isFreeTrialActive = await checkUserFreeTrial(telegramId);
    const isSubscriptionActive = await checkUserSubscription(telegramId);

    if (isFreeTrialActive || isSubscriptionActive) {

        const file = ctx.message.document;
        const fileType = file.mime_type;

        if (
            fileType == "application/pdf"
            ||
            fileType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ||
            fileType == "text/plain"
            ||
            fileType == "application/msword"
        ) {

            const replyMessage = await ctx.reply(
                "Your work is being checked. This might take a minute. 🙂‍↔️",
                { reply_to_message_id: ctx.message.message_id }
            );

            try {

                const fileID = file.file_id;
                const fileURL = await ctx.telegram.getFileLink(fileID);

                copyleaks.loginAsync(
                    process.env.COPYLEAKS_EMAIL,
                    process.env.COPYLEAKS_API_KEY
                )
                .then((loginResult) => {

                    const logoBase64 = imageBase64();

                    let submission = new CopyleaksURLSubmissionModel(
                        fileURL,
                        {
                            sandbox: false,
                            webhooks: {
                                status: `${process.env.WEBHOOK_URL}/copyleaks/{STATUS}`
                            },
                            developerPayload: JSON.stringify({
                                chat_id: ctx.chat.id,
                                telegram_id: telegramId,
                                token: loginResult,
                                messageID: replyMessage['message_id']
                            }),
                            exclude: {
                                quotes: true,
                            },
                            scanMethodAlgorithm: 1,
                            aiGeneratedText: {
                                detect: true,
                            },
                            sensitivityLevel: 5,
                            pdf: {
                                create: true,
                                version: 2,
                                largeLogo: logoBase64
                            }
                        }
                    );
                
                    copyleaks.submitUrlAsync(
                        loginResult, Date.now() + 1, submission
                    )
                    .then((res) => {

                        console.log(res);

                    })
                    .catch(async (err) => {

                        console.log(
                            "Error occured while submitting file url: " + err
                        );

                        await reportError(
                            ctx.chat.id,
                            `Error:\n\n"Couldn't submit user work to the copyleaks API."`
                        );

                        await ctx.reply(
                            "Sorry, we couldn't scan your file. 😓\n\n" +
                            "We've been already informed about your issue and we'll try to fix it as soon as possible. " +
                            "We advise you to resend your file in 2 hours.\n\n" +
                            "We are sorry for the inconvenience our service might have caused."
                        );

                    })
                
                })
                .catch(async (err) => {

                    console.log("Couldn't login: " + err);

                    await reportError(
                        ctx.chat.id,
                        `Error:\n\n"Couldn't log in."`
                    );

                    await ctx.reply(
                        "Sorry, we couldn't scan your file. 😓\n\n" +
                        "We've been already informed about your issue and we'll try to fix it as soon as possible. " +
                        "We advise you to resend your file in 2 hours.\n\n" +
                        "We are sorry for the inconvenience our service might have caused."
                    );

                })

            } catch (error) {

                console.log(
                    "The following error occured while making request to Copyleaks API: " +
                    error
                );

                await reportError(
                    ctx.chat.id,
                    `Error:\n\n"Error occured in the try and catch block in the handleFileUpload file."`
                );

                await ctx.reply(
                    "Sorry, we couldn't scan your file. 😓\n\n" +
                    "We've been already informed about your issue and we'll try to fix it as soon as possible. " +
                    "We advise you to resend your file in 2 hours.\n\n" +
                    "We are sorry for the inconvenience our service might have caused."
                );

            }

        } else {

            ctx.reply(
                "Sorry, our bot doesn't support the file you have submitted. Currently, " +
                "only the following files are supported: .pdf, .txt, .docx and .doc."
            );

        }

    } else {

        ctx.replyWithHTML(
            "You need to buy a subscription to continue using our bot.\n\n" +
            "You can buy a 1-month subscription (50,000 UZS) by clicking " +
            "\"<b>Buy subscription</b>\" button."
        );

    }

};

module.exports = handleFileUpload;