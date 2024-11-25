const { Markup } = require("telegraf");

async function buySubscription(ctx) {

    ctx.replyWithHTML(
        "<b>AI & Plagiarism detection:</b>\n\n" +
        "- 1-month subscription\n\n" +
        "- instant reports\n\n" +
        "- 99% accuracy\n\n" +
        "- detection of plagiarism\n\n" + 
        "- detection of AI models such as ChatGPT, Gemini, Claude\n\n" +
        "- supported files: .pdf, .docx, .doc and .txt.\n\n" +
        "Price: <b>50,000 UZS</b>",
        Markup.inlineKeyboard(
            [
                Markup.button.url(
                "Contact Admin", 
                "https://t.me/one_problem_solution_2"
                )
            ]
        )
    );

};

module.exports = buySubscription;