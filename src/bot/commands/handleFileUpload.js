const copyleaks = require("../../services/copyleaks.js");
const {checkUserFreeTrial, checkUserSubscription} = require("../../services/dbServices.js");
const {CopyleaksURLSubmissionModel} = require('plagiarism-checker');
const {createWork} = require("../../services/dbServices");
const {downloadAndConvertToBase64, sendFile} = require("../../services/apiServices");
const {get} = require("axios");


async function handleFileUpload(ctx) {
    const user = ctx.from;
    const telegramId = user.id;
    const documentData = ctx.message.document;
    const fileId = documentData.file_id;
    const fileUrlData = await ctx.telegram.getFileLink(fileId);
    const fileLink = fileUrlData.href;

    const fileNameArr = documentData.file_name.split(".")
    const fileType = fileNameArr[fileNameArr.length - 1];

    const currentDateTime = new Date();
    const formattedDateTime = `${currentDateTime.getFullYear()}_${currentDateTime.getMonth() + 1}_${currentDateTime.getDate()}_${currentDateTime.getHours()}_${currentDateTime.getMinutes()}_${currentDateTime.getSeconds()}`;

    const fileUniqueName = `${fileNameArr[0]}_${telegramId}_${formattedDateTime}.${fileType}`;
    const extendedDocumentData = {
        file_link: fileLink,
        file_unique_name: fileUniqueName,
        ...documentData,
    }
    const {status, work} = await createWork(telegramId, extendedDocumentData)

    const response = await get(fileLink, { responseType: 'arraybuffer' });

    const base64File = Buffer.from(response.data).toString('base64');
    console.log("BASE64:", base64File)
    console.log("WORK:", work)
    await sendFile(base64File, work)
}

// async function handleFileUpload(ctx) {
//
//     const telegramId = ctx.from.id;
//
//     const isFreeTrialActive = await checkUserFreeTrial(telegramId);
//     const isSubscriptionActive = await checkUserSubscription(telegramId);
//
//     if (isFreeTrialActive || isSubscriptionActive) {
//
//         const file = ctx.message.document;
//         const fileType = file.mime_type;
//
//         if (
//             fileType == "application/pdf"
//             ||
//             fileType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//             ||
//             fileType == "text/plain"
//             ||
//             fileType == "application/msword"
//         ) {
//
//             ctx.reply(
//                 "Your work is being checked. Please wait.",
//                 { reply_to_message_id: ctx.message.message_id }
//             );
//
//             try {
//
//                 async function processFile() {
//
//                     const fileID = file.file_id;
//                     const fileURL = await ctx.telegram.getFileLink(fileID);
//
//                     copyleaks.loginAsync(
//                         process.env.COPYLEAKS_EMAIL,
//                         process.env.COPYLEAKS_API_KEY
//                     )
//                     .then((loginResult) => {
//
//                         let submission = new CopyleaksURLSubmissionModel(
//                             fileURL,
//                             {
//                                 sandbox: true,
//                                 webhooks: {
//                                     status: `${process.env.WEBHOOK_URL}/copyleaks/{STATUS}`
//                                 },
//                                 developerPayload: JSON.stringify({
//                                     chat_id: ctx.chat.id,
//                                     telegram_id: telegramId,
//                                     token: loginResult
//                                 }),
//                                 aiGeneratedText: {
//                                     detect: true,
//                                 },
//                                 sensitivityLevel: 5,
//                                 pdf: {
//                                     create: true,
//                                 }
//                             }
//                         );
//
//                         copyleaks.submitUrlAsync(
//                             loginResult, Date.now() + 1, submission
//                         )
//                         .then((res) => {
//
//                             console.log(res);
//
//                             ctx.reply(
//                                 "Almost there. You should get the feedback of your work in a few seconds.",
//                                 { reply_to_message_id: ctx.message.message_id }
//                             );
//
//                         })
//                         .catch((err) => {
//
//                             console.log(
//                                 "Error occured while submitting file url: " + err
//                             );
//
//                             ctx.reply(
//                                 "An unexpected error occured! Please try again later."
//                             );
//
//                         })
//
//                     })
//                     .catch((err) => {
//
//                         console.log("Couldn't login: " + err);
//
//                         ctx.reply(
//                             "An unexpected error occured! Please try again later."
//                         );
//
//                     })
//
//                 };
//                 processFile();
//
//             } catch (error) {
//
//                 console.log(
//                     "The following error occured while making request to Copyleaks API: " +
//                     error
//                 );
//
//                 ctx.reply(
//                     "An unexpected error occured! Please try again later."
//                 )
//
//             }
//
//         } else {
//
//             ctx.reply(
//                 "Sorry, our bot doesn't support the file you have submitted. Currently, " +
//                 "only the following files are supported: .pdf, .txt, .docx and .doc."
//             );
//
//         }
//
//     } else {
//
//         ctx.replyWithHTML(
//             "You need to buy a subscription to continue using our bot.\n\n" +
//             "You can buy a 1-month subscription (20,000 UZS) by clicking " +
//             "\"<b>Buy subscription</b>\" button."
//         );
//
//     }
//
// };

module.exports = handleFileUpload;