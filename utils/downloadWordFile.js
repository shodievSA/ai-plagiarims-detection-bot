const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

async function downloadWordFile(fileURL, file) {

    const res = await fetch(fileURL.href);
    const buffer = await res.buffer();

    const filePath = path.join(
        __dirname, "..", "word_files", file.file_name
    );

    fs.writeFileSync(filePath, buffer);

}

module.exports = downloadWordFile;