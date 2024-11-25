const fs = require('fs');
const path = require("path");

function imageBase64() {

    const logoPath = path.resolve(__dirname, "..", "media", "logo.png");

    const imageBuffer = fs.readFileSync(logoPath);
    const base64String = imageBuffer.toString('base64');

    return base64String;

}

module.exports = imageBase64;