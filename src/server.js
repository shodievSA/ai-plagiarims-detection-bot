const express = require("express");
const multer = require("multer");
const bot = require("./bot/bot");
const axios = require("axios");
const {readJSON} = require("./utils/jsonHandlers");

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./reports");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({storage});


// Working endpoint, it is successfully receiving the result of plagiarism check
app.post('/webhook/completed/:workId', async (req, res) => {
    const {workId} = req.params;
    const requestData = req.body;
    const access = await readJSON('access.json');
    console.log(`Received webhook for slug: ${workId}`);
    console.log('Request data:', requestData);
    console.log('Request data:', requestData["results"]["internet"]);
    res.status(200).send({
        message: `Webhook received for slug: ${workId}`,
        receivedData: requestData,
    });
    const exportId = Date.now() + 1;
    await axios.post(`https://api.copyleaks.com/v3/downloads/${workId}/export/${exportId}`, {
        "pdfReport": {
            "verb": "POST",
            "endpoint": `https://apdb.jprq.site/export/${exportId}/pdf-report`
        },
        "completionWebhook": `https://apdb.jprq.site/export/${exportId}/completed`,
        "maxRetries": 3
    }, {
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${access.access_token}`
        },
    })

});

app.post('/export/:exportId/pdf-report', async (req, res) => {
    const {exportId} = req.params;
    const requestData = req.body;
    console.log(`Received exportId ${exportId}`);
    console.log('Request data:', requestData);
    res.status(200).send({
        message: `Webhook received for slug: ${exportId}`,
        receivedData: requestData,
    });
})

app.post('/export/:exportId/completed', async (req, res) => {
    const {exportId} = req.params;
    const requestData = req.body;
    console.log(`Received exportId ${exportId}`);
    console.log('Request data:', requestData);
    res.status(200).send({
        message: `Webhook received for slug: ${exportId}`,
        receivedData: requestData,
    });
})

// NEED TO REVIEW BELOW
app.post('/webhook/export/pdf-report', async (req, res) => {

    console.log(
        "Pdf report endpoint:",
        req.file
    )

    res.sendStatus(200);

});

app.post('/webhook/copyleaks/export-completed', async (req, res) => {

    console.log("Export has completed");
    console.log(req.body);

});

app.post('/webhook/copyleaks/error', (req, res) => {

    console.log('Copyleaks status update:', req.body);
    res.sendStatus(200);

});

app.use(bot.webhookCallback("/webhook"));
app.listen(3000, async () => {

    try {

        await bot.telegram.setWebhook(
            process.env.WEBHOOK_URL
        );

    } catch (err) {

        console.log(
            "Error occured setting up a webhook: " + err
        );

    }

})
