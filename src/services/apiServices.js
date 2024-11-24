const axios = require('axios')
const {writeJSON, readJSON} = require("../utils/jsonHandlers");
const {apiEmail, apiKey} = require("../config/config");

async function authorizeAccount(email, key) {
    try {
        const response = await axios.post("https://id.copyleaks.com/v3/account/login/api", {
            email,
            key,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error sending POST request:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw error;
    }
}

async function sendFile(base64, work) {
    const workId = work.id;
    const workName = work.fileUniqueName;
    const access = await readJSON('access.json');
    const response = await axios.put(`https://api.copyleaks.com/v3/scans/submit/file/work_id_${workId}`, {
        "base64": base64,
        "filename": workName,
        "properties": {
            "webhooks": {
                "status": `https://apdb.jprq.site/webhook/{STATUS}/work_id_${workId}`
            }
        },
        "pdf": {
            "create": true,
        }
    }, {
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${access.access_token}`
        }
    })
    console.log(response.status)
}

const handleRenewAccessData = async () => {
    try {
        const newAccessData = await authorizeAccount(apiEmail, apiKey);
        await writeJSON("access.json", newAccessData);
        console.log("Access data successfully renewed and saved!");
    } catch (error) {
        console.error("Error in renewing access data:", error.message);

        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
        }

        throw error;
    }
};

module.exports = {authorizeAccount, handleRenewAccessData, sendFile}