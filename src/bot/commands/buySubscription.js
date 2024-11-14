async function buySubscription(ctx) {

    ctx.replyWithInvoice({
        title: "AI & Plagiarism detection",
        description:
            "AI & Plagiarism Detection: 1-month subscription with 99% accuracy, " +
            "capable of detecting AI models (e.g., ChatGPT, Gemini, Claude) and " +
            "plagiarism.",
        currency: "UZS",
        prices: JSON.stringify([{ label: "Price", amount: 3000000 }]),
        provider_token: "398062629:TEST:999999999_F91D8F69C042267444B74CC0B3C747757EB0E065",
        payload: "ai-and-plagiarism-detection"
    });

};

module.exports = buySubscription;