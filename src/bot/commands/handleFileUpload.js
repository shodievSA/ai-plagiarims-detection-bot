const copyleaks = require("../../services/copyleaks.js");
const { 
    checkUserFreeTrial, 
    checkUserSubscription 
} = require("../../services/dbServices.js");
const { CopyleaksURLSubmissionModel } = require('plagiarism-checker');
const imageBase64 = require("../../utils/imageBase64.js");


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

            ctx.reply(
                "Your work is being checked. This might take a minute.",
                { reply_to_message_id: ctx.message.message_id }
            );

            try {

                async function processFile() {

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
                                    token: loginResult
                                }),
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
                        .catch((err) => {

                            console.log(
                                "Error occured while submitting file url: " + err
                            );

                            ctx.reply(
                                "An unexpected error occured! Please try again later."
                            );

                        })
                    
                    })
                    .catch((err) => {

                        console.log("Couldn't login: " + err);

                        ctx.reply(
                            "An unexpected error occured! Please try again later."
                        );

                    })

                };
                processFile();

            } catch (error) {

                console.log(
                    "The following error occured while making request to Copyleaks API: " +
                    error
                );

                ctx.reply(
                    "An unexpected error occured! Please try again later."
                )

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